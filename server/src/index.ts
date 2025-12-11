import express, { Request, Response, Application, NextFunction } from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import multer from 'multer';
import path from 'path';
import fs from 'fs';
import { v4 as uuidv4 } from 'uuid';
import { OpenAI } from 'openai';
import { supabaseAdmin, createUserClient } from './lib/supabase';

// Load environment variables
dotenv.config();

const app: Application = express();
const PORT = process.env.PORT || 3001;
const openai = new OpenAI({ apiKey: process.env.OPENAI_API_KEY || '' });

// Configure multer for image uploads
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, 'uploads/');
  },
  filename: (req, file, cb) => {
    const uniqueId = uuidv4();
    const ext = path.extname(file.originalname);
    cb(null, `${uniqueId}${ext}`);
  }
});

const upload = multer({
  storage: storage,
  limits: {
    fileSize: 10 * 1024 * 1024, // 10MB limit
  },
  fileFilter: (req, file, cb) => {
    const allowedTypes = /jpeg|jpg|png|webp/;
    const extname = allowedTypes.test(path.extname(file.originalname).toLowerCase());
    const mimetype = allowedTypes.test(file.mimetype);
    
    if (mimetype && extname) {
      return cb(null, true);
    } else {
      cb(new Error('Only image files (jpeg, jpg, png, webp) are allowed'));
    }
  }
});

// Ensure uploads directory exists
if (!fs.existsSync('uploads')) {
  fs.mkdirSync('uploads');
}

// Helper function to extract user from auth header
const getUserFromAuth = async (req: Request): Promise<{ id: string } | null> => {
  const authHeader = req.headers.authorization;
  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    return null;
  }
  
  const token = authHeader.substring(7);
  
  try {
    // Create a client with the user's token to verify it
    const userClient = createUserClient(token);
    const { data: { user }, error } = await userClient.auth.getUser();
    
    if (error || !user) {
      console.error('Auth error:', error);
      return null;
    }
    
    return { id: user.id };
  } catch (error) {
    console.error('Token verification error:', error);
    return null;
  }
};

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

// Upload and save tank image to user profile
app.post("/api/upload-tank-image", upload.single('image'), async (req: Request, res: Response) => {
  try {
    const user = await getUserFromAuth(req);
    if (!user) {
      return res.status(401).json({ error: "Authentication required" });
    }

    if (!req.file) {
      return res.status(400).json({ error: "Image file is required" });
    }

    const { description = '' } = req.body;

    // Check if user already has 5 images
    const { count } = await supabaseAdmin
      .from('user_tank_images')
      .select('*', { count: 'exact', head: true })
      .eq('user_id', user.id);

    if (count && count >= 5) {
      // Clean up uploaded file
      fs.unlink(req.file.path, () => {});
      return res.status(400).json({ error: "Maximum of 5 images allowed per user" });
    }

    // Save image info to database
    const { data: imageRecord, error: dbError } = await supabaseAdmin
      .from('user_tank_images')
      .insert({
        user_id: user.id,
        filename: req.file.filename,
        original_filename: req.file.originalname,
        file_path: req.file.path,
        file_size: req.file.size,
        mime_type: req.file.mimetype,
        description: description
      })
      .select()
      .single();

    if (dbError) {
      // Clean up uploaded file on database error
      fs.unlink(req.file.path, () => {});
      throw new Error(`Database error: ${dbError.message}`);
    }

    res.json({
      id: imageRecord.id,
      filename: imageRecord.filename,
      original_filename: imageRecord.original_filename,
      description: imageRecord.description,
      uploaded_at: imageRecord.uploaded_at,
      file_size: imageRecord.file_size
    });
  } catch (error: any) {
    // Clean up uploaded file on error
    if (req.file?.path) {
      fs.unlink(req.file.path, () => {});
    }
    console.error('Upload error:', error.message);
    res.status(500).json({ error: error.message });
  }
});

// Get user's saved tank images
app.get("/api/user-tank-images", async (req: Request, res: Response) => {
  try {
    const user = await getUserFromAuth(req);
    if (!user) {
      return res.status(401).json({ error: "Authentication required" });
    }

    const { data: images, error } = await supabaseAdmin
      .from('user_tank_images')
      .select('id, filename, original_filename, description, uploaded_at, file_size')
      .eq('user_id', user.id)
      .order('uploaded_at', { ascending: false });

    if (error) {
      throw new Error(`Database error: ${error.message}`);
    }

    res.json(images || []);
  } catch (error: any) {
    console.error('Get images error:', error.message);
    res.status(500).json({ error: error.message });
  }
});

// Delete user's tank image
app.delete("/api/user-tank-images/:imageId", async (req: Request, res: Response) => {
  try {
    const user = await getUserFromAuth(req);
    if (!user) {
      return res.status(401).json({ error: "Authentication required" });
    }

    const { imageId } = req.params;

    // Get image record first
    const { data: imageRecord, error: fetchError } = await supabaseAdmin
      .from('user_tank_images')
      .select('file_path')
      .eq('id', imageId)
      .eq('user_id', user.id)
      .single();

    if (fetchError || !imageRecord) {
      return res.status(404).json({ error: "Image not found" });
    }

    // Delete from database
    const { error: deleteError } = await supabaseAdmin
      .from('user_tank_images')
      .delete()
      .eq('id', imageId)
      .eq('user_id', user.id);

    if (deleteError) {
      throw new Error(`Database error: ${deleteError.message}`);
    }

    // Delete physical file
    fs.unlink(imageRecord.file_path, (err) => {
      if (err) console.warn('Failed to delete file:', err);
    });

    res.json({ message: "Image deleted successfully" });
  } catch (error: any) {
    console.error('Delete image error:', error.message);
    res.status(500).json({ error: error.message });
  }
});

// Analyze saved tank image
app.post("/api/analyze-saved-image/:imageId", async (req: Request, res: Response) => {
  try {
    const user = await getUserFromAuth(req);
    if (!user) {
      return res.status(401).json({ error: "Authentication required" });
    }

    const { imageId } = req.params;
    const { tankDescription = '' } = req.body;

    // Get image record
    const { data: imageRecord, error: fetchError } = await supabaseAdmin
      .from('user_tank_images')
      .select('*')
      .eq('id', imageId)
      .eq('user_id', user.id)
      .single();

    if (fetchError || !imageRecord) {
      return res.status(404).json({ error: "Image not found" });
    }

    // Check if analysis already exists
    const { data: existingAnalysis } = await supabaseAdmin
      .from('image_analysis_results')
      .select('*')
      .eq('image_id', imageId)
      .single();

    if (existingAnalysis) {
      return res.json({
        score: existingAnalysis.score,
        breakdown: existingAnalysis.breakdown,
        summary: existingAnalysis.summary,
        result: existingAnalysis.summary,
        imageAnalyzed: true,
        cached: true
      });
    }

    // Check if we should use mock data
    const useMock = !process.env.OPENAI_API_KEY || process.env.USE_MOCK_AI === 'true';
    
    let aiResponse: string;
    
    if (useMock) {
      // Mock response for testing
      const mockScore = Math.floor(Math.random() * 40) + 60;
      aiResponse = JSON.stringify({
        score: mockScore,
        breakdown: {
          equipment: "Based on saved image: Good filtration visible. Lighting appears adequate for coral growth.",
          waterParams: "Water appears clear and healthy in the saved image. Regular testing recommended.",
          livestock: "Fish and corals appear healthy from what's visible in your saved photo.",
          recommendations: "Consider adding more live rock structure. Coral placement optimization could improve growth."
        }
      });
    } else {
      // Read the saved image file
      if (!fs.existsSync(imageRecord.file_path)) {
        return res.status(404).json({ error: "Image file not found on server" });
      }

      const imageBuffer = fs.readFileSync(imageRecord.file_path);
      const base64Image = imageBuffer.toString('base64');
      const imageUrl = `data:${imageRecord.mime_type};base64,${base64Image}`;

      const response = await openai.chat.completions.create({
        model: "gpt-4o",
        messages: [
          {
            role: "system",
            content: `You are an expert marine biologist and aquarium specialist analyzing aquarium photos.

IMPORTANT: You must respond with EXACTLY this JSON format:
{
  "score": [number between 1-100],
  "breakdown": {
    "equipment": "[equipment assessment based on what you see in image, max 240 chars]",
    "waterParams": "[water quality assessment from visual cues, max 240 chars]",
    "livestock": "[fish/coral health and compatibility from image, max 240 chars]",
    "recommendations": "[specific actionable recommendations based on image, max 240 chars]"
  }
}

Analyze the aquarium image for:
- Equipment visible (filters, lights, pumps)
- Water clarity and color
- Livestock health and behavior
- Coral placement and condition
- Overall tank maintenance
- Aquascaping and layout

Scoring criteria (1-100):
- 90-100: Excellent setup visible, minimal improvements needed
- 80-89: Very good setup, minor tweaks recommended
- 70-79: Good setup, some improvements beneficial
- 60-69: Decent setup, several areas need attention
- 50-59: Basic setup, major improvements needed
- Below 50: Poor setup, significant changes required`
          },
          {
            role: "user",
            content: [
              {
                type: "text",
                text: `Analyze this saved aquarium image. Additional context: ${tankDescription || 'No additional description provided.'}`
              },
              {
                type: "image_url",
                image_url: {
                  url: imageUrl,
                  detail: "high"
                }
              }
            ]
          }
        ],
        max_tokens: 1000
      });
      
      aiResponse = response.choices[0].message?.content || '';
    }

    try {
      const parsedResponse = JSON.parse(aiResponse || '{}');
      const breakdown = parsedResponse.breakdown || {};
      const formattedSummary = [
        breakdown.equipment ? `Equipment: ${breakdown.equipment}` : '',
        breakdown.waterParams ? `Water Parameters: ${breakdown.waterParams}` : '',
        breakdown.livestock ? `Livestock: ${breakdown.livestock}` : '',
        breakdown.recommendations ? `Recommendations: ${breakdown.recommendations}` : ''
      ].filter(Boolean).join('\n\n');
      
      // Save analysis results to database
      await supabaseAdmin
        .from('image_analysis_results')
        .insert({
          user_id: user.id,
          image_id: imageId,
          score: parsedResponse.score || 50,
          breakdown: breakdown,
          summary: formattedSummary || 'Unable to analyze image properly.'
        });

      res.json({
        score: parsedResponse.score || 50,
        breakdown: breakdown,
        summary: formattedSummary || 'Unable to analyze image properly.',
        result: formattedSummary || 'Unable to analyze image properly.',
        imageAnalyzed: true
      });
    } catch (parseError) {
      console.warn('AI response parsing failed, using fallback');
      const fallbackSummary = aiResponse?.substring(0, 960) || 'Image analysis unavailable.';
      
      // Save fallback analysis
      await supabaseAdmin
        .from('image_analysis_results')
        .insert({
          user_id: user.id,
          image_id: imageId,
          score: 50,
          breakdown: {},
          summary: fallbackSummary
        });

      res.json({
        score: 50,
        breakdown: {},
        summary: fallbackSummary,
        result: fallbackSummary,
        imageAnalyzed: true
      });
    }
  } catch (error: any) {
    console.error('Image Analysis Error:', error.message);
    res.status(500).json({ error: error.message });
  }
});

// Image analysis endpoint (existing - for one-time uploads)
app.post("/api/analyze-image", upload.single('image'), async (req: Request, res: Response) => {
  try {
    if (!req.file) {
      return res.status(400).json({ error: "Image file is required" });
    }

    const { tankDescription = '' } = req.body;
    const imagePath = req.file.path;

    // Check if we should use mock data
    const useMock = !process.env.OPENAI_API_KEY || process.env.USE_MOCK_AI === 'true';
    
    let aiResponse: string;
    
    if (useMock) {
      // Mock response for testing
      const mockScore = Math.floor(Math.random() * 40) + 60;
      aiResponse = JSON.stringify({
        score: mockScore,
        breakdown: {
          equipment: "Based on image: Good filtration visible. Lighting appears adequate for coral growth.",
          waterParams: "Water looks clear in photo. Continue monitoring parameters for stability.",
          livestock: "Fish and corals appear healthy from what's visible in the image.",
          recommendations: "Consider adding more live rock for biological filtration. Coral placement looks good."
        }
      });
    } else {
      // Convert image to base64
      const imageBuffer = fs.readFileSync(imagePath);
      const base64Image = imageBuffer.toString('base64');
      const imageUrl = `data:${req.file.mimetype};base64,${base64Image}`;

      const response = await openai.chat.completions.create({
        model: "gpt-5.1", // Use gpt-4o for vision capabilities
        messages: [
          {
            role: "system",
            content: `You are an expert marine biologist and aquarium specialist analyzing aquarium photos.

IMPORTANT: You must respond with EXACTLY this JSON format:
{
  "score": [number between 1-100],
  "breakdown": {
    "equipment": "[equipment assessment based on what you see in image, max 240 chars]",
    "waterParams": "[water quality assessment from visual cues, max 240 chars]",
    "livestock": "[fish/coral health and compatibility from image, max 240 chars]",
    "recommendations": "[specific actionable recommendations based on image, max 240 chars]"
  }
}

Analyze the aquarium image for:
- Equipment visible (filters, lights, pumps)
- Water clarity and color
- Livestock health and behavior
- Coral placement and condition
- Overall tank maintenance
- Aquascaping and layout

Scoring criteria (1-100):
- 90-100: Excellent setup visible, minimal improvements needed
- 80-89: Very good setup, minor tweaks recommended
- 70-79: Good setup, some improvements beneficial
- 60-69: Decent setup, several areas need attention
- 50-59: Basic setup, major improvements needed
- Below 50: Poor setup, significant changes required`
          },
          {
            role: "user",
            content: [
              {
                type: "text",
                text: `Analyze this aquarium setup image. Additional context: ${tankDescription || 'No additional description provided.'}`
              },
              {
                type: "image_url",
                image_url: {
                  url: imageUrl,
                  detail: "high"
                }
              }
            ]
          }
        ],
        max_completion_tokens: 1000
      });
      
      aiResponse = response.choices[0].message?.content || '';
    }

    // Clean up uploaded file
    fs.unlink(imagePath, (err) => {
      if (err) console.warn('Failed to delete uploaded file:', err);
    });

    try {
      const parsedResponse = JSON.parse(aiResponse || '{}');
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
        summary: formattedSummary || 'Unable to analyze image properly.',
        result: formattedSummary || 'Unable to analyze image properly.',
        imageAnalyzed: true
      });
    } catch (parseError) {
      console.warn('AI response parsing failed, using fallback');
      res.json({
        score: 50,
        breakdown: {},
        summary: aiResponse?.substring(0, 960) || 'Image analysis unavailable.',
        result: aiResponse?.substring(0, 960) || 'Image analysis unavailable.',
        imageAnalyzed: true
      });
    }
  } catch (error: any) {
    // Clean up uploaded file on error
    if (req.file?.path) {
      fs.unlink(req.file.path, (err) => {
        if (err) console.warn('Failed to delete uploaded file on error:', err);
      });
    }
    console.error('Image Analysis Error:', error.message);
    res.status(500).json({ error: error.message });
  }
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
app.use((err: Error, req: Request, res: Response, next: NextFunction) => {
  console.error('Error:', err.message);
  res.status(500).json({
    message: err.message || 'Internal server error',
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