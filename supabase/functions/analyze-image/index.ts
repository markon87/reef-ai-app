import { serve } from "https://deno.land/std@0.168.0/http/server.ts"

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
    // Parse multipart form data for image upload
    const formData = await req.formData()
    const imageFile = formData.get('image') as File
    const tankDescription = formData.get('tankDescription') as string || ''

    if (!imageFile) {
      return new Response(
        JSON.stringify({ error: 'No image file provided' }),
        { 
          status: 400, 
          headers: { ...corsHeaders, 'Content-Type': 'application/json' }
        }
      )
    }

    // Validate file type and size
    const allowedTypes = ['image/jpeg', 'image/jpg', 'image/png', 'image/webp']
    if (!allowedTypes.includes(imageFile.type)) {
      return new Response(
        JSON.stringify({ error: 'Invalid file type. Only JPEG, PNG, and WebP images are allowed.' }),
        { 
          status: 400, 
          headers: { ...corsHeaders, 'Content-Type': 'application/json' }
        }
      )
    }

    const maxSize = 10 * 1024 * 1024 // 10MB
    if (imageFile.size > maxSize) {
      return new Response(
        JSON.stringify({ error: 'File too large. Maximum size is 10MB.' }),
        { 
          status: 400, 
          headers: { ...corsHeaders, 'Content-Type': 'application/json' }
        }
      )
    }

    // Convert image to base64 for OpenAI
    const imageBuffer = await imageFile.arrayBuffer()
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
                  text: `Analyze this reef aquarium image and provide a detailed assessment. Context: ${tankDescription || 'No additional context provided'}\n\nPlease analyze the image and provide your response as a JSON object with this exact structure:\n{\n  "score": <number 1-100>,\n  "generalAssessment": "<detailed overall assessment>",\n  "breakdown": {\n    "equipment": "<equipment analysis>",\n    "waterParams": "<water quality assessment>",\n    "livestock": "<fish and coral health>",\n    "recommendations": "<specific recommendations>"\n  },\n  "summary": "<brief summary>",\n  "result": "<final verdict>",\n  "imageAnalyzed": true,\n  "cached": false\n}`
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