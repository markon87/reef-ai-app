import express, { Request, Response, Application } from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import { OpenAI } from 'openai';

// Load environment variables
dotenv.config();

const app: Application = express();
const PORT = process.env.PORT || 3001;
const openai = new OpenAI({ apiKey: process.env.OPENAI_API_KEY || '' });

// Middleware
app.use(cors({
  origin: [
    'http://localhost:5173', 
    'http://localhost:3000',
    'https://reefai-cd607.web.app',           // Your Firebase hosting URL
    'https://reefai-cd607.firebaseapp.com',  // Firebase alternative URL
    'https://your-custom-domain.com'         // If you add custom domain later
  ],
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization']
}));
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Routes
app.get('/', (req: Request, res: Response) => {
  res.json({
    message: 'Reef AI Server is running! 🌊',
    status: 'success',
    timestamp: new Date().toISOString()
  });
});

app.get('/api/health', (req: Request, res: Response) => {
  res.json({
    status: 'healthy',
    uptime: process.uptime(),
    timestamp: new Date().toISOString()
  });
});

// AI interaction endpoint
app.post("/api/analyze", async (req: Request, res: Response) => {
  try {
    const { tankDescription } = req.body;

    if (!tankDescription) {
      return res.status(400).json({ 
        error: "tankDescription is required" 
      });
    }

    // Check if we should use mock data (for testing when quota is exceeded)
    const useMock = !process.env.OPENAI_API_KEY || process.env.USE_MOCK_AI === 'true';
    
    let aiResponse: string;
    
    if (useMock) {
      // Mock response for testing
      const mockScore = Math.floor(Math.random() * 40) + 60; // 60-99 range
      aiResponse = JSON.stringify({
        score: mockScore,
        breakdown: {
          equipment: "Good filtration and lighting setup. Consider upgrading protein skimmer for better water quality.",
          waterParams: "pH and salinity are within acceptable range. Monitor alkalinity and calcium levels regularly.",
          livestock: "Current fish selection shows good compatibility. Avoid aggressive species in this setup.",
          recommendations: "Add wave makers for better circulation. Consider gradual coral additions starting with hardy LPS species."
        }
      });
    } else {
      const response = await openai.chat.completions.create({
        model: "gpt-4o-mini",
        messages: [
          { 
            role: "system", 
            content: `You are an expert marine biologist and aquarium specialist. 

IMPORTANT: You must respond with EXACTLY this JSON format:
{
  "score": [number between 1-100],
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

Each breakdown section must be under 240 characters. Total response should be around 960 characters max.`
          },
          { role: "user", content: `Analyze this aquarium setup with detailed breakdown:\n\n${tankDescription}` },
        ],
      });
      
      aiResponse = response.choices[0].message?.content || '';
    }
    
    try {
      // Parse the AI response as JSON
      const parsedResponse = JSON.parse(aiResponse || '{}');
      
      // Format the breakdown into a readable summary
      const breakdown = parsedResponse.breakdown || {};
      const formattedSummary = [
        breakdown.equipment ? `Equipment: ${breakdown.equipment}` : '',
        breakdown.waterParams ? `Water Parameters: ${breakdown.waterParams}` : '',
        breakdown.livestock ? `Livestock: ${breakdown.livestock}` : '',
        breakdown.recommendations ? `Recommendations: ${breakdown.recommendations}` : ''
      ].filter(Boolean).join('\n\n');
      
      res.json({
        score: parsedResponse.score || 50,
        breakdown: breakdown,
        summary: formattedSummary || 'Unable to analyze setup properly.',
        result: formattedSummary || 'Unable to analyze setup properly.'
      });
    } catch (parseError) {
      // Fallback if AI doesn't return proper JSON
      console.warn('AI response parsing failed, using fallback');
      res.json({
        score: 50,
        breakdown: {},
        summary: aiResponse?.substring(0, 960) || 'Analysis unavailable.',
        result: aiResponse?.substring(0, 960) || 'Analysis unavailable.'
      });
    }
  } catch (error: any) {
    console.error('OpenAI API Error:', error.message);
    res.status(500).json({ error: error.message });
  }
});

// 404 handler (must be after all routes)
app.use((req: Request, res: Response) => {
  res.status(404).json({
    message: 'Route not found',
    status: 'error',
    path: req.path
  });
});

// Error handler (must be last)
app.use((err: Error, req: Request, res: Response) => {
  console.error('Error:', err.message);
  res.status(500).json({
    message: 'Internal server error',
    status: 'error'
  });
});

// Start server
app.listen(PORT, () => {
  console.log(`🚀 Reef AI Server is running on port ${PORT}`);
  console.log(`📡 Health check available at /api/health`);
  console.log(`🌊 Environment: ${process.env.NODE_ENV || 'development'}`);
});

export default app;