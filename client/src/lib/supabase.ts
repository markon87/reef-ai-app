import { createClient } from '@supabase/supabase-js'

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY

if (!supabaseUrl || !supabaseAnonKey) {
  throw new Error('Missing Supabase environment variables. Please check your .env file.')
}

export const supabase = createClient(supabaseUrl, supabaseAnonKey)

// Types for our database
export interface Database {
  public: {
    Tables: {
      tank_setups: {
        Row: {
          id: string
          user_id: string
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
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          user_id: string
          name: string
          volume: number
          lighting: string
          filtration: string[]
          has_protein_skimmer?: boolean
          has_heater?: boolean
          has_wavemaker?: boolean
          water_ph?: number | null
          water_salinity?: number | null
          water_temperature?: number | null
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          user_id?: string
          name?: string
          volume?: number
          lighting?: string
          filtration?: string[]
          has_protein_skimmer?: boolean
          has_heater?: boolean
          has_wavemaker?: boolean
          water_ph?: number | null
          water_salinity?: number | null
          water_temperature?: number | null
          created_at?: string
          updated_at?: string
        }
      }
      tank_fish: {
        Row: {
          id: string
          tank_setup_id: string
          species_id: string
          quantity: number
        }
        Insert: {
          id?: string
          tank_setup_id: string
          species_id: string
          quantity?: number
        }
        Update: {
          id?: string
          tank_setup_id?: string
          species_id?: string
          quantity?: number
        }
      }
      tank_corals: {
        Row: {
          id: string
          tank_setup_id: string
          species_id: string
          quantity: number
        }
        Insert: {
          id?: string
          tank_setup_id: string
          species_id: string
          quantity?: number
        }
        Update: {
          id?: string
          tank_setup_id?: string
          species_id?: string
          quantity?: number
        }
      }
      analysis_results: {
        Row: {
          id: string
          tank_setup_id: string
          score: number
          summary: string | null
          breakdown: Record<string, any> | null
          created_at: string
        }
        Insert: {
          id?: string
          tank_setup_id: string
          score: number
          summary?: string | null
          breakdown?: Record<string, any> | null
          created_at?: string
        }
        Update: {
          id?: string
          tank_setup_id?: string
          score?: number
          summary?: string | null
          breakdown?: Record<string, any> | null
          created_at?: string
        }
      }
    }
    Views: {
      [_ in never]: never
    }
    Functions: {
      [_ in never]: never
    }
    Enums: {
      [_ in never]: never
    }
  }
}