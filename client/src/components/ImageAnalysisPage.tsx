import { useState, useRef } from 'react';
import {
  Box,
  Paper,
  Typography,
  Button,
  TextField,
  Alert,
  CircularProgress,
  Card,
  CardContent,
  Divider,
  Tabs,
  Tab,
  useTheme,
  alpha
} from '@mui/material';
import {
  CloudUpload,
  Delete,
  PhotoCamera,
  Psychology,
  AutoFixHigh
} from '@mui/icons-material';
import { SetupScoreGauge } from './SetupScoreGauge';
import { AnalysisBreakdownComponent } from './AnalysisBreakdown';
import { SavedTankImages } from './SavedTankImages';

interface AnalysisResult {
  score: number;
  breakdown: {
    equipment?: string;
    waterParams?: string;
    livestock?: string;
    recommendations?: string;
  };
  summary: string;
  result: string;
  imageAnalyzed?: boolean;
}

export const ImageAnalysisPage = () => {
  const theme = useTheme();
  const [tabValue, setTabValue] = useState(0);
  const [selectedImage, setSelectedImage] = useState<File | null>(null);
  const [imagePreview, setImagePreview] = useState<string | null>(null);
  const [description, setDescription] = useState('');
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [analysisResult, setAnalysisResult] = useState<AnalysisResult | null>(null);

  const handleSavedImageAnalysis = (result: AnalysisResult) => {
    setAnalysisResult(result);
  };
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleImageSelect = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      // Validate file type
      const allowedTypes = ['image/jpeg', 'image/jpg', 'image/png', 'image/webp'];
      if (!allowedTypes.includes(file.type)) {
        setError('Please select a valid image file (JPEG, PNG, or WebP)');
        return;
      }

      // Validate file size (10MB limit)
      if (file.size > 10 * 1024 * 1024) {
        setError('Image file size must be less than 10MB');
        return;
      }

      setSelectedImage(file);
      setError('');

      // Create preview
      const reader = new FileReader();
      reader.onload = (e) => {
        setImagePreview(e.target?.result as string);
      };
      reader.readAsDataURL(file);
    }
  };

  const handleDrop = (event: React.DragEvent<HTMLDivElement>) => {
    event.preventDefault();
    const file = event.dataTransfer.files[0];
    if (file) {
      // Create a synthetic event to reuse the same validation logic
      const fileInput = document.createElement('input');
      const fileList = new DataTransfer();
      fileList.items.add(file);
      fileInput.files = fileList.files;
      const syntheticEvent = {
        target: fileInput
      } as React.ChangeEvent<HTMLInputElement>;
      handleImageSelect(syntheticEvent);
    }
  };

  const handleDragOver = (event: React.DragEvent<HTMLDivElement>) => {
    event.preventDefault();
  };

  const removeImage = () => {
    setSelectedImage(null);
    setImagePreview(null);
    setError('');
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  const handleAnalyze = async () => {
    if (!selectedImage) {
      setError('Please select an image to analyze');
      return;
    }

    setIsAnalyzing(true);
    setError('');
    setAnalysisResult(null);

    try {
      const formData = new FormData();
      formData.append('image', selectedImage);
      formData.append('tankDescription', description);

      // Use Supabase Edge Functions for image analysis
      const apiUrl = import.meta.env.VITE_API_URL || 'https://qalrrazrdxefsedrizgb.supabase.co/functions/v1';
      const response = await fetch(`${apiUrl}/analyze-image`, {
        method: 'POST',
        body: formData
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || 'Failed to analyze image');
      }

      setAnalysisResult(data);
      setSuccess('Image analysis completed successfully!');
      setTimeout(() => setSuccess(''), 3000);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to analyze image');
    } finally {
      setIsAnalyzing(false);
    }
  };

  return (
    <Box sx={{ maxWidth: 1200, margin: '0 auto', p: 3 }}>
      {/* Header */}
      <Box sx={{ mb: 4, textAlign: 'center' }}>
        <Typography
          variant="h3"
          sx={{
            fontWeight: 700,
            mb: 2,
            background: `linear-gradient(135deg, ${theme.palette.primary.main}, ${theme.palette.secondary.main})`,
            backgroundClip: 'text',
            WebkitBackgroundClip: 'text',
            WebkitTextFillColor: 'transparent',
          }}
        >
          AI Image Analysis
        </Typography>
        <Typography variant="h6" color="text.secondary" sx={{ mb: 3 }}>
          Upload a photo of your reef tank and get AI-powered analysis and recommendations
        </Typography>
      </Box>

      {/* Tabs */}
      <Box sx={{ borderBottom: 1, borderColor: 'divider', mb: 3 }}>
        <Tabs value={tabValue} onChange={(_, newValue) => setTabValue(newValue)}>
          <Tab label="Upload New Image" />
          <Tab label="My Saved Images" />
        </Tabs>
      </Box>

      {/* Alerts */}
      {error && (
        <Alert severity="error" sx={{ mb: 3 }} onClose={() => setError('')}>
          {error}
        </Alert>
      )}
      {success && (
        <Alert severity="success" sx={{ mb: 3 }} onClose={() => setSuccess('')}>
          {success}
        </Alert>
      )}

      {tabValue === 0 && (
        <Box sx={{ display: 'flex', flexDirection: { xs: 'column', lg: 'row' }, gap: 4 }}>
        {/* Left Panel - Image Upload */}
        <Card sx={{ flex: 1 }}>
          <CardContent>
            <Typography variant="h5" gutterBottom sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
              <PhotoCamera color="primary" />
              Upload Tank Image
            </Typography>            {/* Image Upload Area */}
            <Paper
              sx={{
                border: `2px dashed ${alpha(theme.palette.primary.main, 0.3)}`,
                borderRadius: 2,
                p: 4,
                textAlign: 'center',
                cursor: 'pointer',
                transition: 'all 0.3s ease',
                '&:hover': {
                  borderColor: theme.palette.primary.main,
                  backgroundColor: alpha(theme.palette.primary.main, 0.05),
                },
                mb: 3
              }}
              onDrop={handleDrop}
              onDragOver={handleDragOver}
              onClick={() => fileInputRef.current?.click()}
            >
              <input
                ref={fileInputRef}
                type="file"
                accept="image/*"
                onChange={handleImageSelect}
                style={{ display: 'none' }}
              />

              {imagePreview ? (
                <Box>
                  <Box
                    component="img"
                    src={imagePreview}
                    alt="Tank preview"
                    sx={{
                      maxWidth: '100%',
                      maxHeight: 300,
                      borderRadius: 1,
                      mb: 2
                    }}
                  />
                  <Box sx={{ display: 'flex', justifyContent: 'center', gap: 2 }}>
                    <Button
                      variant="outlined"
                      startIcon={<Delete />}
                      onClick={(e) => {
                        e.stopPropagation();
                        removeImage();
                      }}
                    >
                      Remove Image
                    </Button>
                  </Box>
                </Box>
              ) : (
                <Box>
                  <CloudUpload sx={{ fontSize: 48, color: 'primary.main', mb: 2 }} />
                  <Typography variant="h6" gutterBottom>
                    Drop your tank image here or click to browse
                  </Typography>
                  <Typography variant="body2" color="text.secondary">
                    Supports JPEG, PNG, WebP up to 10MB
                  </Typography>
                </Box>
              )}
            </Paper>

            {/* Optional Description */}
            <Typography variant="h6" gutterBottom>
              Additional Description (Optional)
            </Typography>
            <TextField
              fullWidth
              multiline
              rows={4}
              placeholder="Provide any additional context about your tank setup..."
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              sx={{ mb: 3 }}
            />

            {/* Analyze Button */}
            <Button
              fullWidth
              variant="contained"
              size="large"
              startIcon={isAnalyzing ? <CircularProgress size={20} /> : <Psychology />}
              onClick={handleAnalyze}
              disabled={!selectedImage || isAnalyzing}
              sx={{
                py: 1.5,
                fontSize: '1.1rem',
                fontWeight: 600,
              }}
            >
              {isAnalyzing ? 'Analyzing Image...' : 'Analyze Tank Image'}
            </Button>
          </CardContent>
        </Card>

          {/* Right Panel - Analysis Results (Upload tab only) */}
          <Card sx={{ flex: 1 }}>
            <CardContent>
              <Typography variant="h5" gutterBottom sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                <AutoFixHigh color="primary" />
                Tank Setup Assessment
              </Typography>

              {analysisResult ? (
                <>
                  {/* Score Gauge */}
                  <Box sx={{ mb: 3 }}>
                    <SetupScoreGauge score={analysisResult.score} />
                  </Box>

                  <Divider sx={{ mb: 3 }} />

                  {/* Analysis Breakdown */}
                  <AnalysisBreakdownComponent breakdown={analysisResult.breakdown} />
                </>
              ) : (
                <Box sx={{ 
                  display: 'flex', 
                  flexDirection: 'column', 
                  alignItems: 'center', 
                  justifyContent: 'center',
                  minHeight: 300,
                  color: 'text.secondary'
                }}>
                  <Psychology sx={{ fontSize: 64, mb: 2, opacity: 0.3 }} />
                  <Typography variant="h6" gutterBottom>
                    No Analysis Yet
                  </Typography>
                  <Typography variant="body2">
                    Upload an image of your reef tank to see AI-powered analysis and recommendations
                  </Typography>
                </Box>
              )}
            </CardContent>
          </Card>
        </Box>
      )}

      {tabValue === 1 && (
        <SavedTankImages onAnalyzeImage={handleSavedImageAnalysis} />
      )}
      
      {/* Analysis Results - Show for both tabs */}
      {analysisResult && (
        <Card sx={{ mt: 4 }}>
          <CardContent>
            <Typography variant="h5" gutterBottom sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
              <AutoFixHigh color="primary" />
              Analysis Results
            </Typography>

            {/* Score Gauge */}
            <Box sx={{ mb: 3 }}>
              <SetupScoreGauge score={analysisResult.score} />
            </Box>

            <Divider sx={{ mb: 3 }} />

            {/* Analysis Breakdown */}
            <AnalysisBreakdownComponent breakdown={analysisResult.breakdown} />
          </CardContent>
        </Card>
      )}
    </Box>
  );
};