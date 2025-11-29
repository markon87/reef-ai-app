import { serve } from "https://deno.land/std@0.168.0/http/server.ts"

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
}

serve(async (req) => {
  // Handle CORS preflight
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders })
  }

  // Allow public access for health check
  const authHeader = req.headers.get('Authorization')
  const apiKey = req.headers.get('apikey')
  
  if (!authHeader && !apiKey) {
    // For public health check, return basic info
    return new Response(
      JSON.stringify({
        message: 'Reef AI Public Health Check 🌊',
        status: 'healthy',
        timestamp: new Date().toISOString(),
        platform: 'Supabase Edge Functions'
      }),
      { 
        headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
      }
    )
  }

  return new Response(
    JSON.stringify({
      message: 'Reef AI Server is running! 🌊',
      status: 'healthy',
      timestamp: new Date().toISOString(),
      platform: 'Supabase Edge Functions'
    }),
    { 
      headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
    }
  )
})