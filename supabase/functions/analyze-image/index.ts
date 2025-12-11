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

    // Convert image to base64 for OpenAI safely for large images
    const imageBuffer = await imageFile.arrayBuffer()
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
      const promptText = 'You are a reef aquarium expert. Analyze this reef tank image in detail. Context: ' + (tankDescription || 'No additional context provided') + '\n\nProvide a comprehensive analysis covering equipment, water quality, livestock, and recommendations.\n\nRespond ONLY with valid JSON in this exact format:\n{\n  "score": 85,\n  "generalAssessment": "Detailed overall assessment",\n  "breakdown": {\n    "equipment": "Equipment analysis",\n    "waterParams": "Water quality assessment",\n    "livestock": "Livestock analysis",\n    "recommendations": "Specific recommendations"\n  },\n  "summary": "Brief summary",\n  "result": "Final assessment",\n  "imageAnalyzed": true,\n  "cached": false\n}\n\nProvide meaningful analysis, not placeholder text.'

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