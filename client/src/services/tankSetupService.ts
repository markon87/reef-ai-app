import { supabase } from '../lib/supabase'
import { type TankSetup } from '../components/TankSetupForm'

export interface AnalysisResult {
  score: number
  summary?: string
  result?: string
  breakdown?: Record<string, any>
}

export interface SavedTankSetup {
  id: string
  name: string
  volume: number
  lighting: string
  filtration: string[]
  has_protein_skimmer: boolean
  has_heater: boolean
  has_wavemaker: boolean
  water_ph: number | null
  water_salinity: number | null
  water_temperature: number | null
  fish: Array<{ species_id: string; quantity: number }>
  corals: Array<{ species_id: string; quantity: number }>
  analysis_result?: AnalysisResult | null
  created_at: string
  updated_at: string
}

export class TankSetupService {
  static async saveTankSetup(setup: TankSetup, name: string, analysisResult?: AnalysisResult): Promise<{ data: SavedTankSetup | null; error: string | null }> {
    try {
      const { data: { user } } = await supabase.auth.getUser()
      
      if (!user) {
        return { data: null, error: 'You must be logged in to save tank setups' }
      }

      // Insert tank setup
      const { data: tankSetup, error: tankError } = await supabase
        .from('tank_setups')
        .insert({
          user_id: user.id,
          name,
          volume: setup.volume,
          lighting: setup.lighting,
          filtration: setup.filtration,
          has_protein_skimmer: setup.hasProteinSkimmer,
          has_heater: setup.hasHeater,
          has_wavemaker: setup.hasWavemaker,
          water_ph: setup.waterParams.ph || null,
          water_salinity: setup.waterParams.salinity || null,
          water_temperature: setup.waterParams.temperature || null,
        })
        .select()
        .single()

      if (tankError) {
        return { data: null, error: tankError.message }
      }

      // Insert fish
      if (setup.fish.length > 0) {
        const fishData = setup.fish.map(fish => ({
          tank_setup_id: tankSetup.id,
          species_id: fish.species,
          quantity: fish.quantity
        }))
        
        const { error: fishError } = await supabase
          .from('tank_fish')
          .insert(fishData)

        if (fishError) {
          // Clean up tank setup if fish insertion fails
          await supabase.from('tank_setups').delete().eq('id', tankSetup.id)
          return { data: null, error: `Failed to save fish: ${fishError.message}` }
        }
      }

      // Insert corals
      if (setup.corals.length > 0) {
        const coralData = setup.corals.map(coral => ({
          tank_setup_id: tankSetup.id,
          species_id: coral.species,
          quantity: coral.quantity
        }))
        
        const { error: coralError } = await supabase
          .from('tank_corals')
          .insert(coralData)

        if (coralError) {
          // Clean up tank setup if coral insertion fails
          await supabase.from('tank_setups').delete().eq('id', tankSetup.id)
          return { data: null, error: `Failed to save corals: ${coralError.message}` }
        }
      }

      // Save analysis result if provided
      if (analysisResult) {
        const { error: analysisError } = await supabase
          .from('analysis_results')
          .insert({
            tank_setup_id: tankSetup.id,
            score: analysisResult.score,
            summary: analysisResult.summary || analysisResult.result || null,
            breakdown: analysisResult.breakdown || null
          })

        if (analysisError) {
          console.warn('Failed to save analysis result:', analysisError.message)
          // Don't fail the entire save operation for this
        }
      }

      // Fetch the complete setup with fish, corals, and analysis
      const completeSetup = await this.getTankSetup(tankSetup.id)
      return completeSetup
      
    } catch (error) {
      return { data: null, error: 'An unexpected error occurred while saving the tank setup' }
    }
  }

  static async getTankSetup(id: string): Promise<{ data: SavedTankSetup | null; error: string | null }> {
    try {
      const { data: { user } } = await supabase.auth.getUser()
      
      if (!user) {
        return { data: null, error: 'You must be logged in to view tank setups' }
      }

      // Get tank setup
      const { data: tankSetup, error: tankError } = await supabase
        .from('tank_setups')
        .select('*')
        .eq('id', id)
        .eq('user_id', user.id)
        .single()

      if (tankError) {
        return { data: null, error: tankError.message }
      }

      // Get fish
      const { data: fishData, error: fishError } = await supabase
        .from('tank_fish')
        .select('species_id, quantity')
        .eq('tank_setup_id', id)

      if (fishError) {
        return { data: null, error: `Failed to load fish: ${fishError.message}` }
      }

      // Get corals
      const { data: coralData, error: coralError } = await supabase
        .from('tank_corals')
        .select('species_id, quantity')
        .eq('tank_setup_id', id)

      if (coralError) {
        return { data: null, error: `Failed to load corals: ${coralError.message}` }
      }

      // Get latest analysis result
      const { data: analysisData, error: analysisError } = await supabase
        .from('analysis_results')
        .select('score, summary, breakdown')
        .eq('tank_setup_id', id)
        .order('created_at', { ascending: false })
        .limit(1)
        .single()

      if (analysisError && analysisError.code !== 'PGRST116') { // PGRST116 = no rows found
        console.warn('Failed to load analysis result:', analysisError.message)
      }

      const completeSetup: SavedTankSetup = {
        ...tankSetup,
        fish: fishData || [],
        corals: coralData || [],
        analysis_result: analysisData ? {
          score: analysisData.score,
          summary: analysisData.summary || undefined,
          breakdown: analysisData.breakdown || undefined
        } : null
      }

      return { data: completeSetup, error: null }
      
    } catch (error) {
      return { data: null, error: 'An unexpected error occurred while loading the tank setup' }
    }
  }

  static async getUserTankSetups(): Promise<{ data: SavedTankSetup[] | null; error: string | null }> {
    try {
      const { data: { user } } = await supabase.auth.getUser()
      
      if (!user) {
        return { data: null, error: 'You must be logged in to view tank setups' }
      }

      // Get tank setups with the latest analysis results
      const { data: setups, error } = await supabase
        .from('tank_setups')
        .select(`
          *,
          tank_fish(species_id, quantity),
          tank_corals(species_id, quantity),
          analysis_results(score, summary, breakdown, created_at)
        `)
        .eq('user_id', user.id)
        .order('created_at', { ascending: false })

      if (error) {
        return { data: null, error: error.message }
      }

      // Transform the data to match our interface
      const transformedSetups: SavedTankSetup[] = (setups || []).map(setup => {
        // Get the latest analysis result
        const latestAnalysis = setup.analysis_results && setup.analysis_results.length > 0 
          ? setup.analysis_results.sort((a: any, b: any) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime())[0]
          : null

        return {
          id: setup.id,
          name: setup.name,
          volume: setup.volume,
          lighting: setup.lighting,
          filtration: setup.filtration,
          has_protein_skimmer: setup.has_protein_skimmer,
          has_heater: setup.has_heater,
          has_wavemaker: setup.has_wavemaker,
          water_ph: setup.water_ph,
          water_salinity: setup.water_salinity,
          water_temperature: setup.water_temperature,
          fish: (setup.tank_fish || []).map((f: any) => ({ species_id: f.species_id, quantity: f.quantity })),
          corals: (setup.tank_corals || []).map((c: any) => ({ species_id: c.species_id, quantity: c.quantity })),
          analysis_result: latestAnalysis ? {
            score: latestAnalysis.score,
            summary: latestAnalysis.summary || undefined,
            breakdown: latestAnalysis.breakdown || undefined
          } : null,
          created_at: setup.created_at,
          updated_at: setup.updated_at
        }
      })

      return { data: transformedSetups, error: null }
      
    } catch (error) {
      return { data: null, error: 'An unexpected error occurred while loading tank setups' }
    }
  }

  static async deleteTankSetup(id: string): Promise<{ error: string | null }> {
    try {
      const { data: { user } } = await supabase.auth.getUser()
      
      if (!user) {
        return { error: 'You must be logged in to delete tank setups' }
      }

      const { error } = await supabase
        .from('tank_setups')
        .delete()
        .eq('id', id)
        .eq('user_id', user.id)

      if (error) {
        return { error: error.message }
      }

      return { error: null }
      
    } catch (error) {
      return { error: 'An unexpected error occurred while deleting the tank setup' }
    }
  }

  static async updateTankSetup(id: string, setup: TankSetup, name: string, analysisResult?: AnalysisResult): Promise<{ data: SavedTankSetup | null; error: string | null }> {
    try {
      const { data: { user } } = await supabase.auth.getUser()
      
      if (!user) {
        return { data: null, error: 'You must be logged in to update tank setups' }
      }

      // Update tank setup
      const { error: tankError } = await supabase
        .from('tank_setups')
        .update({
          name,
          volume: setup.volume,
          lighting: setup.lighting,
          filtration: setup.filtration,
          has_protein_skimmer: setup.hasProteinSkimmer,
          has_heater: setup.hasHeater,
          has_wavemaker: setup.hasWavemaker,
          water_ph: setup.waterParams.ph || null,
          water_salinity: setup.waterParams.salinity || null,
          water_temperature: setup.waterParams.temperature || null,
        })
        .eq('id', id)
        .eq('user_id', user.id)

      if (tankError) {
        return { data: null, error: tankError.message }
      }

      // Delete existing fish and corals
      await supabase.from('tank_fish').delete().eq('tank_setup_id', id)
      await supabase.from('tank_corals').delete().eq('tank_setup_id', id)

      // Insert new fish
      if (setup.fish.length > 0) {
        const fishData = setup.fish.map(fish => ({
          tank_setup_id: id,
          species_id: fish.species,
          quantity: fish.quantity
        }))
        
        const { error: fishError } = await supabase
          .from('tank_fish')
          .insert(fishData)

        if (fishError) {
          return { data: null, error: `Failed to update fish: ${fishError.message}` }
        }
      }

      // Insert new corals
      if (setup.corals.length > 0) {
        const coralData = setup.corals.map(coral => ({
          tank_setup_id: id,
          species_id: coral.species,
          quantity: coral.quantity
        }))
        
        const { error: coralError } = await supabase
          .from('tank_corals')
          .insert(coralData)

        if (coralError) {
          return { data: null, error: `Failed to update corals: ${coralError.message}` }
        }
      }

      // Save new analysis result if provided
      if (analysisResult) {
        const { error: analysisError } = await supabase
          .from('analysis_results')
          .insert({
            tank_setup_id: id,
            score: analysisResult.score,
            summary: analysisResult.summary || analysisResult.result || null,
            breakdown: analysisResult.breakdown || null
          })

        if (analysisError) {
          console.warn('Failed to save analysis result:', analysisError.message)
        }
      }

      // Fetch the updated complete setup
      const updatedSetup = await this.getTankSetup(id)
      return updatedSetup
      
    } catch (error) {
      return { data: null, error: 'An unexpected error occurred while updating the tank setup' }
    }
  }

  // Convert SavedTankSetup back to TankSetup for the form
  static savedToTankSetup(saved: SavedTankSetup): TankSetup {
    return {
      volume: saved.volume,
      lighting: saved.lighting,
      filtration: saved.filtration,
      hasProteinSkimmer: saved.has_protein_skimmer,
      hasHeater: saved.has_heater,
      hasWavemaker: saved.has_wavemaker,
      fish: saved.fish.map(f => ({ species: f.species_id, quantity: f.quantity })),
      corals: saved.corals.map(c => ({ species: c.species_id, quantity: c.quantity })),
      waterParams: {
        ph: saved.water_ph || undefined,
        salinity: saved.water_salinity || undefined,
        temperature: saved.water_temperature || undefined
      }
    }
  }
}