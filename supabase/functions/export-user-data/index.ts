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

    // Fetch all user data for export
    const [
      tankSetupsResponse,
      analysisResultsResponse,
      imageAnalysesResponse,
      userImagesResponse
    ] = await Promise.all([
      // Tank setups with fish and corals
      supabaseClient
        .from('tank_setups')
        .select(`
          *,
          tank_fish (*),
          tank_corals (*),
          analysis_results (*)
        `)
        .eq('user_id', user.id),
      
      // All analysis results
      supabaseClient
        .from('analysis_results')
        .select('*')
        .eq('tank_setups.user_id', user.id),
      
      // Image analysis results
      supabaseClient
        .from('image_analysis_results')
        .select('*')
        .eq('user_id', user.id),
      
      // User uploaded images
      supabaseClient
        .from('user_tank_images')
        .select('*')
        .eq('user_id', user.id)
    ])

    // Prepare export data
    const exportData = {
      exportInfo: {
        exportDate: new Date().toISOString(),
        userId: user.id,
        userEmail: user.email,
        appVersion: '1.0.0'
      },
      userProfile: {
        id: user.id,
        email: user.email,
        displayName: user.user_metadata?.display_name,
        createdAt: user.created_at,
        settings: {
          displayUnits: user.user_metadata?.display_units || 'imperial',
          emailNotifications: user.user_metadata?.email_notifications || false
        }
      },
      tankSetups: tankSetupsResponse.data || [],
      analysisResults: analysisResultsResponse.data || [],
      imageAnalyses: imageAnalysesResponse.data || [],
      uploadedImages: (userImagesResponse.data || []).map(img => ({
        ...img,
        // Don't include full file paths for security, just metadata
        file_path: undefined,
        filename: img.filename,
        original_filename: img.original_filename,
        file_size: img.file_size,
        content_type: img.content_type,
        uploaded_at: img.uploaded_at,
        description: img.description
      })),
      statistics: {
        totalTankSetups: tankSetupsResponse.data?.length || 0,
        totalAnalyses: analysisResultsResponse.data?.length || 0,
        totalImageAnalyses: imageAnalysesResponse.data?.length || 0,
        totalUploadedImages: userImagesResponse.data?.length || 0
      }
    }

    return new Response(JSON.stringify({
      success: true,
      userData: exportData
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