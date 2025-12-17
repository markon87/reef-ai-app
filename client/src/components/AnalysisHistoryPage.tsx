import { useState, useEffect } from 'react';
import {
  Box,
  Typography,
  Card,
  CardContent,
  Chip,
  Tabs,
  Tab,
  Button,
  Alert,
  CircularProgress,
  Divider,
  Avatar,
  Paper
} from '@mui/material';
import {
  ArrowBack,
  History,
  PhotoCamera,
  Build,
  CalendarToday,
  Score,
  Visibility
} from '@mui/icons-material';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import { useUnits } from '../contexts/UnitsContext';

interface TankAnalysisResult {
  id: string;
  tank_setup_name: string;
  score: number;
  summary: string;
  general_assessment: string;
  breakdown: any;
  created_at: string;
  setup_volume?: number;
}

interface ImageAnalysisResult {
  id: string;
  image_filename: string;
  image_url: string;
  score: number;
  summary: string;
  breakdown: any;
  analyzed_at: string;
  original_filename: string;
}

export function AnalysisHistoryPage() {
  const navigate = useNavigate();
  const { user, session } = useAuth();
  const { formatVolume, getVolumeUnit } = useUnits();
  const [tabValue, setTabValue] = useState(0);
  const [tankAnalyses, setTankAnalyses] = useState<TankAnalysisResult[]>([]);
  const [imageAnalyses, setImageAnalyses] = useState<ImageAnalysisResult[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    if (user && session) {
      loadAnalysisHistory();
    }
  }, [user, session]);

  const loadAnalysisHistory = async () => {
    if (!session) return;

    setLoading(true);
    try {
      const apiUrl = import.meta.env.VITE_API_URL || 'https://qalrrazrdxefsedrizgb.supabase.co/functions/v1';
      
      const response = await fetch(`${apiUrl}/get-analysis-history`, {
        method: 'GET',
        headers: {
          'Authorization': `Bearer ${session.access_token}`
        }
      });

      const data = await response.json();
      
      if (!response.ok) {
        throw new Error(data.error || 'Failed to load analysis history');
      }

      setTankAnalyses(data.tankAnalyses || []);
      setImageAnalyses(data.imageAnalyses || []);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to load analysis history');
    } finally {
      setLoading(false);
    }
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  const getScoreColor = (score: number) => {
    if (score >= 80) return 'success';
    if (score >= 60) return 'warning';
    return 'error';
  };

  const renderTankAnalyses = () => (
    <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
      {tankAnalyses.length === 0 ? (
        <Paper sx={{ p: 4, textAlign: 'center' }}>
          <Build sx={{ fontSize: 48, color: 'text.secondary', mb: 2 }} />
          <Typography variant="h6" color="text.secondary" gutterBottom>
            No Tank Setup Analyses Yet
          </Typography>
          <Typography variant="body2" color="text.secondary" sx={{ mb: 3 }}>
            Analyze your tank setups to see results here
          </Typography>
          <Button
            variant="contained"
            startIcon={<Build />}
            onClick={() => navigate('/')}
          >
            Create Tank Setup
          </Button>
        </Paper>
      ) : (
        tankAnalyses.map((analysis) => (
          <Card key={analysis.id} sx={{ border: 1, borderColor: 'divider' }}>
            <CardContent>
              <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', mb: 2 }}>
                <Box sx={{ flex: 1 }}>
                  <Typography variant="h6" gutterBottom sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                    <Build color="primary" />
                    {analysis.tank_setup_name}
                  </Typography>
                  {analysis.setup_volume && (
                    <Typography variant="body2" color="text.secondary" gutterBottom>
                      Tank Volume: {formatVolume(analysis.setup_volume)} {getVolumeUnit()}
                    </Typography>
                  )}
                </Box>
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                  <Chip
                    label={`Score: ${analysis.score}`}
                    color={getScoreColor(analysis.score)}
                    avatar={<Score />}
                  />
                </Box>
              </Box>

              <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
                {analysis.summary}
              </Typography>

              {analysis.general_assessment && (
                <Typography variant="body2" sx={{ mb: 2, p: 2, bgcolor: 'background.default', borderRadius: 1 }}>
                  {analysis.general_assessment}
                </Typography>
              )}

              <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mt: 2 }}>
                <Typography variant="caption" color="text.secondary" sx={{ display: 'flex', alignItems: 'center', gap: 0.5 }}>
                  <CalendarToday sx={{ fontSize: 14 }} />
                  {formatDate(analysis.created_at)}
                </Typography>
                <Button
                  size="small"
                  startIcon={<Visibility />}
                  onClick={() => {
                    // Navigate to setup builder with analysis loaded
                    navigate('/', { state: { analysisId: analysis.id } });
                  }}
                >
                  View Details
                </Button>
              </Box>
            </CardContent>
          </Card>
        ))
      )}
    </Box>
  );

  const renderImageAnalyses = () => (
    <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
      {imageAnalyses.length === 0 ? (
        <Paper sx={{ p: 4, textAlign: 'center' }}>
          <PhotoCamera sx={{ fontSize: 48, color: 'text.secondary', mb: 2 }} />
          <Typography variant="h6" color="text.secondary" gutterBottom>
            No Image Analyses Yet
          </Typography>
          <Typography variant="body2" color="text.secondary" sx={{ mb: 3 }}>
            Upload and analyze tank images to see results here
          </Typography>
          <Button
            variant="contained"
            startIcon={<PhotoCamera />}
            onClick={() => navigate('/image-analysis')}
          >
            Analyze Images
          </Button>
        </Paper>
      ) : (
        imageAnalyses.map((analysis) => (
          <Card key={analysis.id} sx={{ border: 1, borderColor: 'divider' }}>
            <CardContent>
              <Box sx={{ display: 'flex', gap: 2, alignItems: 'flex-start' }}>
                <Avatar
                  src={analysis.image_url}
                  sx={{ width: 80, height: 80, borderRadius: 2 }}
                  variant="rounded"
                >
                  <PhotoCamera />
                </Avatar>
                
                <Box sx={{ flex: 1 }}>
                  <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', mb: 1 }}>
                    <Typography variant="h6" sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                      <PhotoCamera color="primary" />
                      {analysis.original_filename}
                    </Typography>
                    <Chip
                      label={`Score: ${analysis.score}`}
                      color={getScoreColor(analysis.score)}
                      avatar={<Score />}
                      size="small"
                    />
                  </Box>

                  <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
                    {analysis.summary}
                  </Typography>

                  <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                    <Typography variant="caption" color="text.secondary" sx={{ display: 'flex', alignItems: 'center', gap: 0.5 }}>
                      <CalendarToday sx={{ fontSize: 14 }} />
                      {formatDate(analysis.analyzed_at)}
                    </Typography>
                    <Button
                      size="small"
                      startIcon={<Visibility />}
                      onClick={() => {
                        // Navigate to image analysis page with this image
                        navigate('/image-analysis', { state: { imageId: analysis.id } });
                      }}
                    >
                      View Analysis
                    </Button>
                  </Box>
                </Box>
              </Box>
            </CardContent>
          </Card>
        ))
      )}
    </Box>
  );

  if (loading) {
    return (
      <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', minHeight: 400 }}>
        <CircularProgress />
      </Box>
    );
  }

  return (
    <Box sx={{ p: 3 }}>
      {/* Header */}
      <Box sx={{ display: 'flex', alignItems: 'center', gap: 2, mb: 3 }}>
        <Button
          startIcon={<ArrowBack />}
          onClick={() => navigate(-1)}
          variant="outlined"
          size="small"
        >
          Back
        </Button>
        <Typography variant="h4" sx={{ display: 'flex', alignItems: 'center', gap: 1, flex: 1 }}>
          <History color="primary" />
          Analysis History
        </Typography>
      </Box>

      {/* Description */}
      <Paper sx={{ p: 3, mb: 3, bgcolor: 'background.default' }}>
        <Typography variant="body1" color="text.secondary">
          View all your previous tank setup analyses and image analyses. 
          Track your progress and revisit detailed analysis results.
        </Typography>
      </Paper>

      {error && (
        <Alert severity="error" sx={{ mb: 3 }} onClose={() => setError('')}>
          {error}
        </Alert>
      )}

      {/* Tabs */}
      <Box sx={{ mb: 3 }}>
        <Tabs value={tabValue} onChange={(_, value) => setTabValue(value)}>
          <Tab
            label={
              <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                <Build />
                Tank Setups ({tankAnalyses.length})
              </Box>
            }
          />
          <Tab
            label={
              <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                <PhotoCamera />
                Image Analyses ({imageAnalyses.length})
              </Box>
            }
          />
        </Tabs>
        <Divider />
      </Box>

      {/* Content */}
      {tabValue === 0 && renderTankAnalyses()}
      {tabValue === 1 && renderImageAnalyses()}
    </Box>
  );
}