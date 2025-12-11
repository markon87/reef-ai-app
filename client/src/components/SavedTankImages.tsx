import { useState, useEffect } from 'react';
import {
  Box,
  Card,
  CardContent,
  Typography,
  Button,
  IconButton,
  Dialog,
  DialogTitle,
  DialogContent,
  TextField,
  Alert,
  CircularProgress,
  Chip,
  useTheme,
  alpha
} from '@mui/material';
import {
  PhotoCamera,
  CloudUpload,
  Delete,
  Psychology,
  Add,
  Image as ImageIcon
} from '@mui/icons-material';
import { useAuth } from '../contexts/AuthContext';

interface UserTankImage {
  id: string;
  filename: string;
  original_filename: string;
  description?: string;
  uploaded_at: string;
  file_size: number;
}

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
  cached?: boolean;
}

interface SavedTankImagesProps {
  onAnalyzeImage?: (result: AnalysisResult) => void;
}

export const SavedTankImages = ({ onAnalyzeImage }: SavedTankImagesProps) => {
  const theme = useTheme();
  const { user, session } = useAuth();
  const [images, setImages] = useState<UserTankImage[]>([]);
  const [loading, setLoading] = useState(false);
  const [uploadDialogOpen, setUploadDialogOpen] = useState(false);
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [description, setDescription] = useState('');
  const [uploading, setUploading] = useState(false);
  const [analyzing, setAnalyzing] = useState<string | null>(null);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  const fetchImages = async () => {
    if (!user || !session) return;
    
    setLoading(true);
    try {
      const token = session.access_token;
      const apiUrl = import.meta.env.VITE_API_URL || 'https://qalrrazrdxefsedrizgb.supabase.co/functions/v1';
      
      const response = await fetch(`${apiUrl}/manage-images`, {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });

      if (!response.ok) {
        throw new Error('Failed to fetch images');
      }

      const data = await response.json();
      setImages(data);
    } catch (err) {
      console.error('Error fetching images:', err);
      setError('Failed to load your saved images');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchImages();
  }, [user, session]);

  const handleFileSelect = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      const allowedTypes = ['image/jpeg', 'image/jpg', 'image/png', 'image/webp'];
      if (!allowedTypes.includes(file.type)) {
        setError('Please select a valid image file (JPEG, PNG, or WebP)');
        return;
      }

      if (file.size > 10 * 1024 * 1024) {
        setError('Image file size must be less than 10MB');
        return;
      }

      setSelectedFile(file);
      setError('');
    }
  };

  const handleUpload = async () => {
    if (!selectedFile || !user || !session) return;

    setUploading(true);
    try {
      const token = session.access_token;
      const apiUrl = import.meta.env.VITE_API_URL || 'https://qalrrazrdxefsedrizgb.supabase.co/functions/v1';
      
      const formData = new FormData();
      formData.append('image', selectedFile);
      formData.append('description', description);

      const response = await fetch(`${apiUrl}/upload-image`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`
        },
        body: formData
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || 'Failed to upload image');
      }

      setSuccess('Image uploaded successfully!');
      setUploadDialogOpen(false);
      setSelectedFile(null);
      setDescription('');
      fetchImages(); // Refresh the list
      setTimeout(() => setSuccess(''), 3000);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to upload image');
    } finally {
      setUploading(false);
    }
  };

  const handleDelete = async (imageId: string) => {
    if (!user || !session) return;

    try {
      const token = session.access_token;
      const apiUrl = import.meta.env.VITE_API_URL || 'https://qalrrazrdxefsedrizgb.supabase.co/functions/v1';
      
      const response = await fetch(`${apiUrl}/manage-images/${imageId}`, {
        method: 'DELETE',
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });      if (!response.ok) {
        throw new Error('Failed to delete image');
      }

      setSuccess('Image deleted successfully!');
      fetchImages(); // Refresh the list
      setTimeout(() => setSuccess(''), 3000);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to delete image');
    }
  };

  const handleAnalyze = async (imageId: string) => {
    if (!user || !session) return;
    
    setAnalyzing(imageId);
    try {
      const token = session.access_token;
      const apiUrl = import.meta.env.VITE_API_URL || 'https://qalrrazrdxefsedrizgb.supabase.co/functions/v1';
      
      const response = await fetch(`${apiUrl}/analyze-saved-image`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({ imageId })
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || 'Failed to analyze image');
      }

      if (onAnalyzeImage) {
        onAnalyzeImage(data);
      }
      
      setSuccess(
        data.cached 
          ? 'Analysis retrieved from cache!' 
          : 'Image analysis completed successfully!'
      );
      setTimeout(() => setSuccess(''), 3000);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to analyze image');
    } finally {
      setAnalyzing(null);
    }
  };

  const formatFileSize = (bytes: number) => {
    if (bytes === 0) return '0 Bytes';
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
  };

  return (
    <Box>
      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3 }}>
        <Typography variant="h5" sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
          <PhotoCamera color="primary" />
          Saved Tank Images ({images.length}/5)
        </Typography>
        <Button
          variant="contained"
          startIcon={<Add />}
          onClick={() => setUploadDialogOpen(true)}
          disabled={images.length >= 5}
        >
          Upload Image
        </Button>
      </Box>

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

      {loading ? (
        <Box sx={{ display: 'flex', justifyContent: 'center', p: 4 }}>
          <CircularProgress />
        </Box>
      ) : images.length === 0 ? (
        <Card>
          <CardContent sx={{ textAlign: 'center', py: 6 }}>
            <ImageIcon sx={{ fontSize: 64, color: 'text.secondary', mb: 2 }} />
            <Typography variant="h6" gutterBottom>
              No Saved Images Yet
            </Typography>
            <Typography variant="body2" color="text.secondary" sx={{ mb: 3 }}>
              Upload photos of your reef tank to analyze them with AI
            </Typography>
            <Button
              variant="contained"
              startIcon={<Add />}
              onClick={() => setUploadDialogOpen(true)}
            >
              Upload Your First Image
            </Button>
          </CardContent>
        </Card>
      ) : (
        <Box sx={{ 
          display: 'grid', 
          gridTemplateColumns: { 
            xs: '1fr', 
            sm: 'repeat(2, 1fr)', 
            md: 'repeat(3, 1fr)' 
          }, 
          gap: 3 
        }}>
          {images.map((image) => (
            <Box key={image.id}>
              <Card 
                sx={{ 
                  height: '100%', 
                  display: 'flex', 
                  flexDirection: 'column',
                  transition: 'transform 0.2s',
                  '&:hover': {
                    transform: 'translateY(-4px)'
                  }
                }}
              >
                <Box
                  sx={{
                    height: 200,
                    bgcolor: alpha(theme.palette.primary.main, 0.1),
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    position: 'relative'
                  }}
                >
                  <ImageIcon sx={{ fontSize: 48, color: 'primary.main' }} />
                  <IconButton
                    sx={{
                      position: 'absolute',
                      top: 8,
                      right: 8,
                      bgcolor: 'background.paper',
                      '&:hover': {
                        bgcolor: 'error.main',
                        color: 'white'
                      }
                    }}
                    onClick={() => handleDelete(image.id)}
                  >
                    <Delete />
                  </IconButton>
                </Box>
                <CardContent sx={{ flexGrow: 1 }}>
                  <Typography variant="h6" noWrap gutterBottom>
                    {image.original_filename}
                  </Typography>
                  {image.description && (
                    <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
                      {image.description}
                    </Typography>
                  )}
                  <Box sx={{ display: 'flex', gap: 1, mb: 2, flexWrap: 'wrap' }}>
                    <Chip 
                      size="small" 
                      label={formatFileSize(image.file_size)} 
                      variant="outlined" 
                    />
                    <Chip 
                      size="small" 
                      label={new Date(image.uploaded_at).toLocaleDateString()} 
                      variant="outlined" 
                    />
                  </Box>
                  <Button
                    fullWidth
                    variant="contained"
                    startIcon={analyzing === image.id ? <CircularProgress size={20} /> : <Psychology />}
                    onClick={() => handleAnalyze(image.id)}
                    disabled={analyzing === image.id}
                  >
                    {analyzing === image.id ? 'Analyzing...' : 'Analyze Image'}
                  </Button>
                </CardContent>
              </Card>
            </Box>
          ))}
        </Box>
      )}

      {/* Upload Dialog */}
      <Dialog open={uploadDialogOpen} onClose={() => setUploadDialogOpen(false)} maxWidth="sm" fullWidth>
        <DialogTitle>Upload Tank Image</DialogTitle>
        <DialogContent>
          <Box sx={{ mt: 2 }}>
            <input
              type="file"
              accept="image/*"
              onChange={handleFileSelect}
              style={{ display: 'none' }}
              id="file-input"
            />
            <label htmlFor="file-input">
              <Button
                variant="outlined"
                component="span"
                fullWidth
                startIcon={<CloudUpload />}
                sx={{ mb: 2, py: 2 }}
              >
                {selectedFile ? selectedFile.name : 'Choose Image File'}
              </Button>
            </label>
            
            <TextField
              fullWidth
              label="Description (Optional)"
              multiline
              rows={3}
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="Describe your tank setup..."
              sx={{ mb: 2 }}
            />

            <Box sx={{ display: 'flex', gap: 2, justifyContent: 'flex-end' }}>
              <Button onClick={() => setUploadDialogOpen(false)}>Cancel</Button>
              <Button
                variant="contained"
                onClick={handleUpload}
                disabled={!selectedFile || uploading}
                startIcon={uploading ? <CircularProgress size={20} /> : <CloudUpload />}
              >
                {uploading ? 'Uploading...' : 'Upload'}
              </Button>
            </Box>
          </Box>
        </DialogContent>
      </Dialog>
    </Box>
  );
};