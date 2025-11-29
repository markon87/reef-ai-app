import { serve } from "https://deno.land/std@0.168.0/http/server.ts"

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
  'Access-Control-Allow-Methods': 'POST, OPTIONS',
}

serve(async (req) => {
  // Handle CORS preflight requests
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders })
  }

  // Get auth headers (but don't require them for now - make it public)
  const authHeader = req.headers.get('Authorization')
  const apiKey = req.headers.get('apikey')
  
  try {
    const { tankDescription } = await req.json()

    if (!tankDescription) {
      return new Response(
        JSON.stringify({ error: "tankDescription is required" }), 
        { 
          status: 400, 
          headers: { ...corsHeaders, 'Content-Type': 'application/json' }
        }
      )
    }

    // Get OpenAI API key from environment
    const openaiApiKey = Deno.env.get('OPENAI_API_KEY')
    const useMock = !openaiApiKey || Deno.env.get('USE_MOCK_AI') === 'true'
    
    let aiResponse: string
    
    if (useMock) {
      // Mock response for testing
      const mockScore = Math.floor(Math.random() * 40) + 60 // 60-99 range
      const mockAssessments = [
        "Excellent reef setup with balanced livestock and proper equipment. Lighting supports coral growth, filtration maintains quality water. Fish compatibility is strong. Consider calcium reactor for long-term coral health. Bioload sustainable with expansion room. Well-planned setup for healthy growth and behavior. Regular maintenance ensures success. Strong foundation for reef keeping.",
        "Solid fundamentals with improvement potential. Fish selection diverse, avoiding aggression. Lighting adequate for moderate corals - upgrade for SPS growth. Add flow pumps to eliminate dead spots. Stable biological filtration processing waste well. Consider backup heating. Match feeding to bioload. Excellent foundation for reef success and coral propagation.",
        "Thoughtful marine ecosystem design with balanced equipment. Livestock promotes natural behaviors, minimizes stress. Healthy biological processes with effective nutrient export. Lighting supports coral cycles. Consider refugium for natural processing. Regular testing prevents parameter drift. Strong foundation for long-term success and gradual expansion."
      ];
      aiResponse = JSON.stringify({
        score: mockScore,
        generalAssessment: mockAssessments[Math.floor(Math.random() * mockAssessments.length)],
        breakdown: {
          equipment: "Good filtration and lighting setup. Consider upgrading protein skimmer for better water quality.",
          waterParams: "pH and salinity are within acceptable range. Monitor alkalinity and calcium levels regularly.",
          livestock: "Current fish selection shows good compatibility. Avoid aggressive species in this setup.",
          recommendations: "Add wave makers for better circulation. Consider gradual coral additions starting with hardy LPS species."
        }
      })
    } else {
      const response = await fetch('https://api.openai.com/v1/chat/completions', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${openaiApiKey}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          model: "gpt-4o-mini",
          messages: [
            { 
              role: "system", 
              content: `You are an expert marine biologist and aquarium specialist. 

IMPORTANT: You must respond with EXACTLY this JSON format:
{
  "score": [number between 1-100],
  "generalAssessment": "[concise overall assessment, max 560 characters]",
  "breakdown": {
    "equipment": "[equipment assessment, max 240 chars]",
    "waterParams": "[water parameters assessment, max 240 chars]", 
    "livestock": "[fish/coral compatibility assessment, max 240 chars]",
    "recommendations": "[specific actionable recommendations, max 240 chars]"
  }
}

Scoring criteria (1-100):
- 90-100: Excellent setup, minimal improvements needed
- 80-89: Very good setup, minor tweaks recommended  
- 70-79: Good setup, some improvements beneficial
- 60-69: Decent setup, several areas need attention
- 50-59: Basic setup, major improvements needed
- Below 50: Poor setup, significant changes required

The generalAssessment should be a concise overview of the tank setup in exactly 560 characters or less, discussing overall health, potential, challenges, and key recommendations. Each breakdown section must be under 240 characters for quick reference.`
            },
            { role: "user", content: `Analyze this aquarium setup with detailed breakdown:\n\n${tankDescription}` },
          ],
        })
      })
      
      if (!response.ok) {
        throw new Error(`OpenAI API error: ${response.status} ${response.statusText}`)
      }
      
      const data = await response.json()
      aiResponse = data.choices?.[0]?.message?.content || ''
    }
    
    try {
      // Parse the AI response as JSON
      const parsedResponse = JSON.parse(aiResponse || '{}')
      
      // Format the breakdown into a readable summary
      const breakdown = parsedResponse.breakdown || {}
      const formattedSummary = [
        breakdown.equipment ? `Equipment: ${breakdown.equipment}` : '',
        breakdown.waterParams ? `Water Parameters: ${breakdown.waterParams}` : '',
        breakdown.livestock ? `Livestock: ${breakdown.livestock}` : '',
        breakdown.recommendations ? `Recommendations: ${breakdown.recommendations}` : ''
      ].filter(Boolean).join('\n\n')
      
      return new Response(
        JSON.stringify({
          score: parsedResponse.score || 50,
          generalAssessment: parsedResponse.generalAssessment || "Assessment not available. Please try again.",
          breakdown: breakdown,
          summary: formattedSummary || 'Unable to analyze setup properly.',
          result: formattedSummary || 'Unable to analyze setup properly.'
        }),
        { 
          headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
        }
      )
    } catch (parseError) {
      // Fallback if AI doesn't return proper JSON
      console.warn('AI response parsing failed, using fallback')
      return new Response(
        JSON.stringify({
          score: 50,
          breakdown: {},
          summary: aiResponse?.substring(0, 960) || 'Analysis unavailable.',
          result: aiResponse?.substring(0, 960) || 'Analysis unavailable.'
        }),
        { 
          headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
        }
      )
    }
  } catch (error: any) {
    console.error('Analysis Error:', error.message)
    
    // Fallback to mock response if OpenAI fails
    const fallbackScore = Math.floor(Math.random() * 30) + 50 // 50-80 range
    return new Response(
      JSON.stringify({
        score: fallbackScore,
        breakdown: {
          equipment: "Analysis temporarily unavailable. Basic setup detected.",
          waterParams: "Unable to analyze water parameters at this time.",
          livestock: "Livestock compatibility check unavailable.",
          recommendations: "Please try again later or contact support."
        },
        summary: "Analysis service temporarily unavailable. This is a fallback response.",
        result: "Analysis service temporarily unavailable. This is a fallback response.",
        error: "Analysis temporarily unavailable"
      }), 
      { 
        status: 200, // Return 200 with error message instead of 500
        headers: { ...corsHeaders, 'Content-Type': 'application/json' }
      }
    )
  }
})