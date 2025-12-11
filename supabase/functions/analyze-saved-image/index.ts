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
    
    // Convert to base64 safely for large images
    const uint8Array = new Uint8Array(imageBuffer)
    let binaryString = ''
    for (let i = 0; i < uint8Array.length; i++) {
      binaryString += String.fromCharCode(uint8Array[i])
    }
    const base64Image = btoa(binaryString)

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
      const promptText = 'You are a reef aquarium expert. Analyze this reef tank image in detail. Context: ' + (image.description || 'No additional context provided') + '\n\nProvide a comprehensive analysis covering equipment, water quality, livestock, and recommendations.\n\nRespond ONLY with valid JSON in this exact format:\n{\n  "score": 85,\n  "generalAssessment": "Detailed overall assessment",\n  "breakdown": {\n    "equipment": "Equipment analysis",\n    "waterParams": "Water quality assessment",\n    "livestock": "Livestock analysis",\n    "recommendations": "Specific recommendations"\n  },\n  "summary": "Brief summary",\n  "result": "Final assessment",\n  "imageAnalyzed": true,\n  "cached": false\n}\n\nProvide meaningful analysis, not placeholder text.'

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
                  text: promptText
                },
                {
                  type: "image_url",
                  image_url: {
                    url: 'data:image/jpeg;base64,' + base64Image
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
        // Fallback if JSON parsing fails - extract meaningful content
        const score = content.match(/score[:\s]*(\d+)/i)?.[1] || '75'
        aiResponse = {
          score: parseInt(score),
          generalAssessment: content.substring(0, 300) + (content.length > 300 ? '...' : ''),
          breakdown: {
            equipment: content.includes('equipment') ? content.match(/equipment[^.]*\./i)?.[0] || 'Equipment assessment included in general analysis.' : 'No specific equipment analysis available.',
            waterParams: content.includes('water') ? content.match(/water[^.]*\./i)?.[0] || 'Water quality assessment included in general analysis.' : 'No specific water parameter analysis available.',
            livestock: content.includes('fish|coral|livestock') ? content.match(/(fish|coral|livestock)[^.]*\./i)?.[0] || 'Livestock assessment included in general analysis.' : 'No specific livestock analysis available.',
            recommendations: content.includes('recommend') ? content.match(/recommend[^.]*\./i)?.[0] || 'Recommendations included in general analysis.' : 'See general assessment for recommendations.'
          },
          summary: content.substring(0, 150) + (content.length > 150 ? '...' : ''),
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