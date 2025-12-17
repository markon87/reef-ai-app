import { createClient } from 'https://esm.sh/@supabase/supabase-js@2'

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
  'Access-Control-Allow-Methods': 'GET, OPTIONS',
}

Deno.serve(async (req) => {
  // Handle CORS preflight requests
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders })
  }

  if (req.method !== 'GET') {
    return new Response(JSON.stringify({ error: 'Method not allowed' }), {
      status: 405,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' }
    })
  }

  try {
    // Initialize Supabase client
    const supabaseClient = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_ANON_KEY') ?? '',
      {
        global: {
          headers: { Authorization: req.headers.get('Authorization')! },
        },
      }
    )

    // Get the current user
    const {
      data: { user },
      error: userError,
    } = await supabaseClient.auth.getUser()

    if (userError || !user) {
      return new Response(JSON.stringify({ error: 'Unauthorized' }), {
        status: 401,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' }
      })
    }

    // Fetch tank setup analyses
    const { data: tankAnalyses, error: tankError } = await supabaseClient
      .from('analysis_results')
      .select(`
        id,
        score,
        summary,
        general_assessment,
        breakdown,
        created_at,
        tank_setups!inner (
          name,
          volume
        )
      `)
      .eq('tank_setups.user_id', user.id)
      .order('created_at', { ascending: false })
      .limit(50)

    if (tankError) {
      console.error('Tank analyses error:', tankError)
    }

    // Fetch image analyses
    const { data: imageAnalyses, error: imageError } = await supabaseClient
      .from('image_analysis_results')
      .select(`
        id,
        score,
        summary,
        breakdown,
        analyzed_at,
        user_tank_images!inner (
          id,
          filename,
          original_filename,
          file_path
        )
      `)
      .eq('user_id', user.id)
      .order('analyzed_at', { ascending: false })
      .limit(50)

    if (imageError) {
      console.error('Image analyses error:', imageError)
    }

    // Transform tank analyses data
    const transformedTankAnalyses = (tankAnalyses || []).map(analysis => ({
      id: analysis.id,
      tank_setup_name: analysis.tank_setups?.name || 'Unknown Setup',
      setup_volume: analysis.tank_setups?.volume,
      score: analysis.score,
      summary: analysis.summary,
      general_assessment: analysis.general_assessment,
      breakdown: analysis.breakdown,
      created_at: analysis.created_at
    }))

    // Transform image analyses data with URLs
    const transformedImageAnalyses = (imageAnalyses || []).map(analysis => {
      const supabaseUrl = Deno.env.get('SUPABASE_URL')
      const imageUrl = analysis.user_tank_images?.file_path 
        ? `${supabaseUrl}/storage/v1/object/public/tank-images/${analysis.user_tank_images.file_path}`
        : null

      return {
        id: analysis.id,
        image_filename: analysis.user_tank_images?.filename || 'Unknown Image',
        original_filename: analysis.user_tank_images?.original_filename || 'Unknown Image',
        image_url: imageUrl,
        score: analysis.score,
        summary: analysis.summary,
        breakdown: analysis.breakdown,
        analyzed_at: analysis.analyzed_at
      }
    })

    return new Response(JSON.stringify({
      tankAnalyses: transformedTankAnalyses,
      imageAnalyses: transformedImageAnalyses,
      totalTankAnalyses: transformedTankAnalyses.length,
      totalImageAnalyses: transformedImageAnalyses.length
    }), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' }
    })

  } catch (error) {
    console.error('Function error:', error)
    return new Response(JSON.stringify({ 
      error: 'Internal server error',
      details: error.message 
    }), {
      status: 500,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' }
    })
  }
})