import { serve } from "https://deno.land/std@0.168.0/http/server.ts"
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2'

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
  'Access-Control-Allow-Methods': 'POST, OPTIONS',
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

    const { imageId } = await req.json()

    if (!imageId) {
      return new Response(
        JSON.stringify({ error: 'Image ID is required' }),
        { 
          status: 400, 
          headers: { ...corsHeaders, 'Content-Type': 'application/json' }
        }
      )
    }

    // Get image details and verify ownership
    const { data: image, error: fetchError } = await supabase
      .from('user_tank_images')
      .select('file_path, description')
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

    // Get signed URL for the image
    const { data: signedUrlData, error: urlError } = await supabase.storage
      .from('tank-images')
      .createSignedUrl(image.file_path, 3600)

    if (urlError || !signedUrlData) {
      throw new Error('Failed to generate image URL')
    }

    // Download the image for analysis
    const imageResponse = await fetch(signedUrlData.signedUrl)
    if (!imageResponse.ok) {
      throw new Error('Failed to download image')
    }

    const imageBuffer = await imageResponse.arrayBuffer()
    const base64Image = btoa(String.fromCharCode(...new Uint8Array(imageBuffer)))

    // Get OpenAI API key
    const openaiApiKey = Deno.env.get('OPENAI_API_KEY')
    const useMock = !openaiApiKey || Deno.env.get('USE_MOCK_AI') === 'true'

    let aiResponse

    if (useMock) {
      // Mock response for testing
      const mockScore = Math.floor(Math.random() * 40) + 60
      aiResponse = {
        score: mockScore,
        generalAssessment: "This is a mock analysis of your tank image. Your setup shows good potential with room for improvement in lighting and flow patterns.",
        breakdown: {
          equipment: "Good basic equipment setup visible. Consider upgrading lighting for coral growth.",
          waterParams: "Water appears clear, suggesting good filtration. Monitor parameters regularly.",
          livestock: "Fish appear healthy and active. Good variety without overcrowding.",
          recommendations: "Consider adding more live rock for biological filtration and coral placement areas."
        },
        summary: "Mock analysis: Your reef tank shows promise with solid fundamentals.",
        result: "Overall score: " + mockScore + "/100 - Good foundation with improvement opportunities.",
        imageAnalyzed: true,
        cached: false
      }
    } else {
      // Real OpenAI Vision API call
      const openaiResponse = await fetch('https://api.openai.com/v1/chat/completions', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${openaiApiKey}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          model: "gpt-4o",
          messages: [
            {
              role: "user",
              content: [
                {
                  type: "text",
                  text: `Analyze this reef aquarium image and provide a detailed assessment. Context: ${image.description || 'No additional context provided'}\n\nPlease analyze the image and provide your response as a JSON object with this exact structure:\n{\n  "score": <number 1-100>,\n  "generalAssessment": "<detailed overall assessment>",\n  "breakdown": {\n    "equipment": "<equipment analysis>",\n    "waterParams": "<water quality assessment>",\n    "livestock": "<fish and coral health>",\n    "recommendations": "<specific recommendations>"\n  },\n  "summary": "<brief summary>",\n  "result": "<final verdict>",\n  "imageAnalyzed": true,\n  "cached": false\n}`
                },
                {
                  type: "image_url",
                  image_url: {
                    url: `data:image/jpeg;base64,${base64Image}`
                  }
                }
              ]
            }
          ],
          max_tokens: 1000
        })
      })

      if (!openaiResponse.ok) {
        throw new Error('OpenAI API request failed')
      }

      const openaiData = await openaiResponse.json()
      const content = openaiData.choices[0].message.content

      try {
        aiResponse = JSON.parse(content)
      } catch (parseError) {
        // Fallback if JSON parsing fails
        aiResponse = {
          score: 75,
          generalAssessment: content,
          breakdown: {
            equipment: "Analysis completed",
            waterParams: "See general assessment",
            livestock: "See general assessment",
            recommendations: "See general assessment"
          },
          summary: "AI analysis completed",
          result: content,
          imageAnalyzed: true,
          cached: false
        }
      }
    }

    // Save analysis result to database
    const { error: saveError } = await supabase
      .from('image_analysis_results')
      .insert({
        user_id: user.id,
        image_id: imageId,
        analysis_data: aiResponse
      })

    if (saveError) {
      console.error('Failed to save analysis:', saveError)
    }

    return new Response(
      JSON.stringify(aiResponse),
      { 
        headers: { ...corsHeaders, 'Content-Type': 'application/json' }
      }
    )

  } catch (error) {
    console.error('Analysis error:', error.message)
    return new Response(
      JSON.stringify({ error: error.message }),
      { 
        status: 500, 
        headers: { ...corsHeaders, 'Content-Type': 'application/json' }
      }
    )
  }
})