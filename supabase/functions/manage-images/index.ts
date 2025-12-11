import { serve } from "https://deno.land/std@0.168.0/http/server.ts"
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2'

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
  'Access-Control-Allow-Methods': 'GET, DELETE, OPTIONS',
}

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders })
  }

  try {
    // Get auth token
    const authHeader = req.headers.get('Authorization')
    if (!authHeader) {
      return new Response(
        JSON.stringify({ error: 'Authorization required' }),
        { 
          status: 401, 
          headers: { ...corsHeaders, 'Content-Type': 'application/json' }
        }
      )
    }

    // Initialize Supabase client
    const supabaseUrl = Deno.env.get('SUPABASE_URL')!
    const supabaseServiceKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!
    const supabase = createClient(supabaseUrl, supabaseServiceKey)

    // Verify user
    const token = authHeader.replace('Bearer ', '')
    const { data: { user }, error: authError } = await supabase.auth.getUser(token)
    
    if (authError || !user) {
      return new Response(
        JSON.stringify({ error: 'Invalid token' }),
        { 
          status: 401, 
          headers: { ...corsHeaders, 'Content-Type': 'application/json' }
        }
      )
    }

    const url = new URL(req.url)
    const imageId = url.pathname.split('/').pop()

    if (req.method === 'GET') {
      // Get all user images
      const { data: images, error } = await supabase
        .from('user_tank_images')
        .select('id, filename, original_filename, description, uploaded_at, file_size, file_path')
        .eq('user_id', user.id)
        .order('uploaded_at', { ascending: false })

      if (error) {
        throw new Error(`Database error: ${error.message}`)
      }

      // Generate signed URLs for the images
      const imagesWithUrls = await Promise.all(
        (images || []).map(async (image) => {
          const { data: signedUrl } = await supabase.storage
            .from('tank-images')
            .createSignedUrl(image.file_path, 3600) // 1 hour expiry

          return {
            ...image,
            url: signedUrl?.signedUrl || null
          }
        })
      )

      return new Response(
        JSON.stringify(imagesWithUrls),
        { 
          headers: { ...corsHeaders, 'Content-Type': 'application/json' }
        }
      )
    }

    if (req.method === 'DELETE') {
      if (!imageId) {
        return new Response(
          JSON.stringify({ error: 'Image ID required' }),
          { 
            status: 400, 
            headers: { ...corsHeaders, 'Content-Type': 'application/json' }
          }
        )
      }

      // Get image details first
      const { data: image, error: fetchError } = await supabase
        .from('user_tank_images')
        .select('file_path')
        .eq('id', imageId)
        .eq('user_id', user.id)
        .single()

      if (fetchError || !image) {
        return new Response(
          JSON.stringify({ error: 'Image not found' }),
          { 
            status: 404, 
            headers: { ...corsHeaders, 'Content-Type': 'application/json' }
          }
        )
      }

      // Delete from storage
      const { error: storageError } = await supabase.storage
        .from('tank-images')
        .remove([image.file_path])

      if (storageError) {
        console.error('Storage deletion error:', storageError)
      }

      // Delete from database
      const { error: dbError } = await supabase
        .from('user_tank_images')
        .delete()
        .eq('id', imageId)
        .eq('user_id', user.id)

      if (dbError) {
        throw new Error(`Database error: ${dbError.message}`)
      }

      return new Response(
        JSON.stringify({ message: 'Image deleted successfully' }),
        { 
          headers: { ...corsHeaders, 'Content-Type': 'application/json' }
        }
      )
    }

    return new Response(
      JSON.stringify({ error: 'Method not allowed' }),
      { 
        status: 405, 
        headers: { ...corsHeaders, 'Content-Type': 'application/json' }
      }
    )

  } catch (error) {
    console.error('Error:', error.message)
    return new Response(
      JSON.stringify({ error: error.message }),
      { 
        status: 500, 
        headers: { ...corsHeaders, 'Content-Type': 'application/json' }
      }
    )
  }
})