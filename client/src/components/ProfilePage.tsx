import { useState, useRef, useEffect } from 'react';
import {
  Box,
  Paper,
  Typography,
  Avatar,
  Button,
  Card,
  CardContent,
  TextField,
  Grid,
  Divider,
  IconButton,
  Alert,
  CircularProgress,
  useTheme,
  alpha
} from '@mui/material';
import {
  Person,
  Edit,
  Save,
  Cancel,
  PhotoCamera,
  Email,
  CalendarToday,
  Delete
} from '@mui/icons-material';
import { useAuth } from '../contexts/AuthContext';

interface ProfileData {
  displayName: string;
  email: string;
  profileImage: string | null;
  createdAt: string;
}

export function ProfilePage() {
  const theme = useTheme();
  const { user, session, refreshUser } = useAuth();
  const fileInputRef = useRef<HTMLInputElement>(null);
  
  const [isEditing, setIsEditing] = useState(false);
  const [loading, setLoading] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [removing, setRemoving] = useState(false);
  const [success, setSuccess] = useState('');
  const [error, setError] = useState('');
  
  const [profileData, setProfileData] = useState<ProfileData>({
    displayName: '',
    email: '',
    profileImage: null,
    createdAt: ''
  });

  const [editData, setEditData] = useState({
    displayName: ''
  });

  useEffect(() => {
    if (user) {
      // Generate profile image URL from avatar_path if it exists
      let profileImageUrl = null;
      if (user.user_metadata?.avatar_path) {
        const supabaseUrl = import.meta.env.VITE_SUPABASE_URL || 'https://qalrrazrdxefsedrizgb.supabase.co';
        profileImageUrl = `${supabaseUrl}/storage/v1/object/public/profile-images/${user.user_metadata.avatar_path}`;
      } else if (user.user_metadata?.avatar_url) {
        // Fallback to avatar_url for backward compatibility
        profileImageUrl = user.user_metadata.avatar_url;
      }

      const data: ProfileData = {
        displayName: user.user_metadata?.display_name || user.email?.split('@')[0] || 'User',
        email: user.email || '',
        profileImage: profileImageUrl,
        createdAt: user.created_at || ''
      };
      setProfileData(data);
      setEditData({ displayName: data.displayName });
    }
  }, [user]);

  const handleEdit = () => {
    setIsEditing(true);
    setEditData({ displayName: profileData.displayName });
  };

  const handleCancel = () => {
    setIsEditing(false);
    setEditData({ displayName: profileData.displayName });
  };

  const handleSave = async () => {
    if (!user || !session) return;
    
    setLoading(true);
    try {
      // Update user metadata through Supabase Edge Function
      const apiUrl = import.meta.env.VITE_API_URL || 'https://qalrrazrdxefsedrizgb.supabase.co/functions/v1';
      const response = await fetch(`${apiUrl}/update-profile`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${session.access_token}`
        },
        body: JSON.stringify({
          display_name: editData.displayName
        })
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || 'Failed to update profile');
      }

      setProfileData(prev => ({ ...prev, displayName: editData.displayName }));
      setIsEditing(false);
      setSuccess('Profile updated successfully!');
      setTimeout(() => setSuccess(''), 3000);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to update profile');
    } finally {
      setLoading(false);
    }
  };

  const handleImageUpload = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file || !user || !session) return;

    // Validate file
    const allowedTypes = ['image/jpeg', 'image/jpg', 'image/png', 'image/webp'];
    if (!allowedTypes.includes(file.type)) {
      setError('Invalid file type. Only JPEG, PNG, and WebP images are allowed.');
      return;
    }

    const maxSize = 5 * 1024 * 1024; // 5MB
    if (file.size > maxSize) {
      setError('File too large. Maximum size is 5MB.');
      return;
    }

    setUploading(true);
    try {
      const apiUrl = import.meta.env.VITE_API_URL || 'https://qalrrazrdxefsedrizgb.supabase.co/functions/v1';
      const formData = new FormData();
      formData.append('image', file);
      formData.append('type', 'profile');

      const response = await fetch(`${apiUrl}/upload-profile-image`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${session.access_token}`
        },
        body: formData
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || 'Failed to upload image');
      }

      // Refresh user data to get updated metadata
      await refreshUser();
      
      setProfileData(prev => ({ ...prev, profileImage: data.imageUrl }));
      setSuccess('Profile image updated successfully!');
      setTimeout(() => setSuccess(''), 3000);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to upload image');
    } finally {
      setUploading(false);
    }
  };

  const handleRemoveImage = async () => {
    if (!user || !session) return;

    setRemoving(true);
    try {
      const apiUrl = import.meta.env.VITE_API_URL || 'https://qalrrazrdxefsedrizgb.supabase.co/functions/v1';
      const response = await fetch(`${apiUrl}/remove-profile-image`, {
        method: 'DELETE',
        headers: {
          'Authorization': `Bearer ${session.access_token}`
        }
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || 'Failed to remove profile image');
      }

      // Refresh user data to get updated metadata
      await refreshUser();
      
      setProfileData(prev => ({ ...prev, profileImage: null }));
      setSuccess('Profile image removed successfully!');
      setTimeout(() => setSuccess(''), 3000);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to remove profile image');
    } finally {
      setRemoving(false);
    }
  };

  const formatDate = (dateString: string) => {
    if (!dateString) return '';
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    });
  };

  const getInitials = (name: string) => {
    return name.split(' ').map(n => n[0]).join('').toUpperCase().substring(0, 2);
  };

  if (!user) return null;

  return (
    <Box sx={{ p: 3, maxWidth: 800, mx: 'auto' }}>
      <Typography variant="h4" gutterBottom sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
        <Person color="primary" />
        Profile
      </Typography>

      {success && (
        <Alert severity="success" sx={{ mb: 3 }} onClose={() => setSuccess('')}>
          {success}
        </Alert>
      )}

      {error && (
        <Alert severity="error" sx={{ mb: 3 }} onClose={() => setError('')}>
          {error}
        </Alert>
      )}

      {/* Profile Image Section */}
      <Card sx={{ mb: 3 }}>
        <CardContent>
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 3, mb: 3 }}>
            <Box sx={{ position: 'relative' }}>
              <Avatar
                sx={{
                  width: 120,
                  height: 120,
                  fontSize: '2rem',
                  bgcolor: theme.palette.primary.main
                }}
                src={profileData.profileImage || undefined}
              >
                {!profileData.profileImage && getInitials(profileData.displayName)}
              </Avatar>
              {profileData.profileImage && (
                <IconButton
                  sx={{
                    position: 'absolute',
                    top: -8,
                    left: -8,
                    width: 32,
                    height: 32,
                    bgcolor: 'error.main',
                    color: 'white',
                    border: `2px solid ${theme.palette.background.paper}`,
                    '&:hover': {
                      bgcolor: 'error.dark'
                    }
                  }}
                  onClick={handleRemoveImage}
                  disabled={uploading || removing}
                >
                  {removing ? <CircularProgress size={16} color="inherit" /> : <Delete sx={{ fontSize: 16 }} />}
                </IconButton>
              )}
              <IconButton
                sx={{
                  position: 'absolute',
                  bottom: -8,
                  right: -8,
                  bgcolor: 'background.paper',
                  border: `2px solid ${theme.palette.divider}`,
                  '&:hover': {
                    bgcolor: 'primary.main',
                    color: 'white'
                  }
                }}
                onClick={() => fileInputRef.current?.click()}
                disabled={uploading || removing}
              >
                {uploading ? <CircularProgress size={20} /> : <PhotoCamera />}
              </IconButton>
            </Box>
            <Box>
              <Typography variant="h5" gutterBottom>
                {profileData.displayName}
              </Typography>
              <Typography variant="body2" color="text.secondary" sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 1 }}>
                <Email fontSize="small" />
                {profileData.email}
              </Typography>
              <Typography variant="body2" color="text.secondary" sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                <CalendarToday fontSize="small" />
                Member since {formatDate(profileData.createdAt)}
              </Typography>
            </Box>
          </Box>

          <input
            ref={fileInputRef}
            type="file"
            accept="image/*"
            style={{ display: 'none' }}
            onChange={handleImageUpload}
          />
        </CardContent>
      </Card>

      {/* Profile Information */}
      <Card>
        <CardContent>
          <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3 }}>
            <Typography variant="h6">
              Profile Information
            </Typography>
            {!isEditing && (
              <Button
                startIcon={<Edit />}
                onClick={handleEdit}
                variant="outlined"
              >
                Edit Profile
              </Button>
            )}
          </Box>

          <Divider sx={{ mb: 3 }} />

          <Grid container spacing={3}>
            <Grid item xs={12} md={6}>
              <Typography variant="subtitle2" color="text.secondary" gutterBottom>
                Display Name
              </Typography>
              {isEditing ? (
                <TextField
                  fullWidth
                  value={editData.displayName}
                  onChange={(e) => setEditData(prev => ({ ...prev, displayName: e.target.value }))}
                  variant="outlined"
                  size="small"
                />
              ) : (
                <Typography variant="body1">
                  {profileData.displayName}
                </Typography>
              )}
            </Grid>

            <Grid item xs={12} md={6}>
              <Typography variant="subtitle2" color="text.secondary" gutterBottom>
                Email Address
              </Typography>
              <Typography variant="body1" color="text.secondary">
                {profileData.email}
              </Typography>
            </Grid>

            <Grid item xs={12} md={6}>
              <Typography variant="subtitle2" color="text.secondary" gutterBottom>
                Account Created
              </Typography>
              <Typography variant="body1">
                {formatDate(profileData.createdAt)}
              </Typography>
            </Grid>

            <Grid item xs={12} md={6}>
              <Typography variant="subtitle2" color="text.secondary" gutterBottom>
                Account Type
              </Typography>
              <Typography variant="body1">
                Standard User
              </Typography>
            </Grid>
          </Grid>

          {isEditing && (
            <Box sx={{ display: 'flex', gap: 2, mt: 3, justifyContent: 'flex-end' }}>
              <Button
                startIcon={<Cancel />}
                onClick={handleCancel}
                variant="outlined"
              >
                Cancel
              </Button>
              <Button
                startIcon={loading ? <CircularProgress size={20} /> : <Save />}
                onClick={handleSave}
                variant="contained"
                disabled={loading || !editData.displayName.trim()}
              >
                Save Changes
              </Button>
            </Box>
          )}
        </CardContent>
      </Card>
    </Box>
  );
}