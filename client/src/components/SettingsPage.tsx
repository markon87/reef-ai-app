import { useState, useEffect } from 'react';
import {
  Box,
  Typography,
  Card,
  CardContent,
  Switch,
  FormControlLabel,
  Button,
  Divider,
  Alert,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  TextField,
  RadioGroup,
  Radio,
  FormControl,
  FormLabel,
  CircularProgress,
  useTheme
} from '@mui/material';
import {
  ArrowBack,
  Settings as SettingsIcon,
  Download,
  Security,
  Notifications,
  Straighten,
  Warning,
  Delete
} from '@mui/icons-material';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import { useUnits } from '../contexts/UnitsContext';

interface UserSettings {
  displayUnits: 'imperial' | 'metric';
  emailNotifications: boolean;
}

export function SettingsPage() {
  const navigate = useNavigate();
  const theme = useTheme();
  const { user, session } = useAuth();
  const { unitSystem, setUnitSystem } = useUnits();
  
  const [settings, setSettings] = useState<UserSettings>({
    displayUnits: 'imperial',
    emailNotifications: false
  });
  
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState('');
  const [error, setError] = useState('');
  
  // Change Password Dialog
  const [passwordDialogOpen, setPasswordDialogOpen] = useState(false);
  const [currentPassword, setCurrentPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [passwordLoading, setPasswordLoading] = useState(false);
  
  // Delete Account Dialog
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [deleteConfirmation, setDeleteConfirmation] = useState('');
  const [deleteLoading, setDeleteLoading] = useState(false);
  
  // Export Data
  const [exportLoading, setExportLoading] = useState(false);

  useEffect(() => {
    loadUserSettings();
  }, [user]);

  const loadUserSettings = async () => {
    if (!user || !session) return;

    try {
      const apiUrl = import.meta.env.VITE_API_URL || 'https://qalrrazrdxefsedrizgb.supabase.co/functions/v1';
      const response = await fetch(`${apiUrl}/get-user-settings`, {
        headers: {
          'Authorization': `Bearer ${session.access_token}`
        }
      });

      if (response.ok) {
        const data = await response.json();
        const loadedSettings = data.settings || settings;
        setSettings(loadedSettings);
        // Sync with UnitsContext
        if (loadedSettings.displayUnits) {
          setUnitSystem(loadedSettings.displayUnits);
        }
      }
    } catch (err) {
      console.error('Failed to load settings:', err);
      // Use default settings if loading fails
    }
  };

  const saveSettings = async (newSettings: Partial<UserSettings>) => {
    if (!user || !session) return;

    setLoading(true);
    try {
      const updatedSettings = { ...settings, ...newSettings };
      const apiUrl = import.meta.env.VITE_API_URL || 'https://qalrrazrdxefsedrizgb.supabase.co/functions/v1';
      
      const response = await fetch(`${apiUrl}/update-user-settings`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${session.access_token}`
        },
        body: JSON.stringify({ settings: updatedSettings })
      });

      const data = await response.json();
      
      if (!response.ok) {
        throw new Error(data.error || 'Failed to save settings');
      }

      setSettings(updatedSettings);
      // Sync with UnitsContext
      if (updatedSettings.displayUnits) {
        setUnitSystem(updatedSettings.displayUnits);
      }
      setSuccess('Settings saved successfully!');
      setTimeout(() => setSuccess(''), 3000);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to save settings');
    } finally {
      setLoading(false);
    }
  };

  const handleChangePassword = async () => {
    if (newPassword !== confirmPassword) {
      setError('New passwords do not match');
      return;
    }

    if (newPassword.length < 6) {
      setError('Password must be at least 6 characters long');
      return;
    }

    setPasswordLoading(true);
    try {
      const apiUrl = import.meta.env.VITE_API_URL || 'https://qalrrazrdxefsedrizgb.supabase.co/functions/v1';
      
      const response = await fetch(`${apiUrl}/change-password`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${session.access_token}`
        },
        body: JSON.stringify({ 
          currentPassword,
          newPassword 
        })
      });

      const data = await response.json();
      
      if (!response.ok) {
        throw new Error(data.error || 'Failed to change password');
      }

      setPasswordDialogOpen(false);
      setCurrentPassword('');
      setNewPassword('');
      setConfirmPassword('');
      setSuccess('Password changed successfully!');
      setTimeout(() => setSuccess(''), 3000);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to change password');
    } finally {
      setPasswordLoading(false);
    }
  };

  const handleExportData = async () => {
    if (!user || !session) return;

    setExportLoading(true);
    try {
      const apiUrl = import.meta.env.VITE_API_URL || 'https://qalrrazrdxefsedrizgb.supabase.co/functions/v1';
      
      const response = await fetch(`${apiUrl}/export-user-data`, {
        headers: {
          'Authorization': `Bearer ${session.access_token}`
        }
      });

      const data = await response.json();
      
      if (!response.ok) {
        throw new Error(data.error || 'Failed to export data');
      }

      // Download the data as JSON file
      const blob = new Blob([JSON.stringify(data.userData, null, 2)], { 
        type: 'application/json' 
      });
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `reef-ai-data-${new Date().toISOString().split('T')[0]}.json`;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      URL.revokeObjectURL(url);

      setSuccess('Data exported successfully!');
      setTimeout(() => setSuccess(''), 3000);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to export data');
    } finally {
      setExportLoading(false);
    }
  };

  const handleDeleteAccount = async () => {
    if (deleteConfirmation !== 'DELETE') {
      setError('Please type DELETE to confirm account deletion');
      return;
    }

    setDeleteLoading(true);
    try {
      const apiUrl = import.meta.env.VITE_API_URL || 'https://qalrrazrdxefsedrizgb.supabase.co/functions/v1';
      
      const response = await fetch(`${apiUrl}/delete-account`, {
        method: 'DELETE',
        headers: {
          'Authorization': `Bearer ${session.access_token}`
        }
      });

      const data = await response.json();
      
      if (!response.ok) {
        throw new Error(data.error || 'Failed to delete account');
      }

      // Account deleted successfully - user will be logged out automatically
      navigate('/');
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to delete account');
      setDeleteLoading(false);
    }
  };

  return (
    <Box sx={{ p: 3, maxWidth: 800, mx: 'auto' }}>
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
          <SettingsIcon color="primary" />
          Settings
        </Typography>
      </Box>

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

      {/* Display Units */}
      <Card sx={{ mb: 3 }}>
        <CardContent>
          <Typography variant="h6" gutterBottom sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
            <Straighten color="primary" />
            Display Units
          </Typography>
          <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
            Choose your preferred unit system for tank volumes and measurements
          </Typography>
          
          <FormControl component="fieldset">
            <RadioGroup
              value={settings.displayUnits}
              onChange={(e) => saveSettings({ displayUnits: e.target.value as 'imperial' | 'metric' })}
              row
            >
              <FormControlLabel 
                value="imperial" 
                control={<Radio />} 
                label="Imperial (Gallons, °F)" 
                disabled={loading}
              />
              <FormControlLabel 
                value="metric" 
                control={<Radio />} 
                label="Metric (Liters, °C)" 
                disabled={loading}
              />
            </RadioGroup>
          </FormControl>
        </CardContent>
      </Card>

      {/* Email Notifications */}
      <Card sx={{ mb: 3 }}>
        <CardContent>
          <Typography variant="h6" gutterBottom sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
            <Notifications color="primary" />
            Email Notifications
          </Typography>
          <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
            Receive email notifications for analysis results and important updates
          </Typography>
          
          <FormControlLabel
            control={
              <Switch
                checked={settings.emailNotifications}
                onChange={(e) => saveSettings({ emailNotifications: e.target.checked })}
                disabled={loading}
              />
            }
            label="Enable email notifications"
          />
        </CardContent>
      </Card>

      {/* Data Management */}
      <Card sx={{ mb: 3 }}>
        <CardContent>
          <Typography variant="h6" gutterBottom sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
            <Download color="primary" />
            Data Management
          </Typography>
          <Typography variant="body2" color="text.secondary" sx={{ mb: 3 }}>
            Export all your tank setups, analyses, and account data
          </Typography>
          
          <Button
            variant="outlined"
            startIcon={exportLoading ? <CircularProgress size={20} /> : <Download />}
            onClick={handleExportData}
            disabled={exportLoading}
            fullWidth
          >
            {exportLoading ? 'Exporting...' : 'Export All Data'}
          </Button>
        </CardContent>
      </Card>

      {/* Account Security */}
      <Card sx={{ mb: 3 }}>
        <CardContent>
          <Typography variant="h6" gutterBottom sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
            <Security color="primary" />
            Account Security
          </Typography>
          <Typography variant="body2" color="text.secondary" sx={{ mb: 3 }}>
            Manage your account security settings
          </Typography>
          
          <Button
            variant="outlined"
            onClick={() => setPasswordDialogOpen(true)}
            fullWidth
            sx={{ mb: 2 }}
          >
            Change Password
          </Button>

          <Divider sx={{ my: 2 }} />

          <Typography variant="subtitle2" color="error" sx={{ mb: 2, display: 'flex', alignItems: 'center', gap: 1 }}>
            <Warning />
            Danger Zone
          </Typography>
          <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
            Permanently delete your account and all associated data
          </Typography>
          
          <Button
            variant="outlined"
            color="error"
            startIcon={<Delete />}
            onClick={() => setDeleteDialogOpen(true)}
            fullWidth
          >
            Delete Account
          </Button>
        </CardContent>
      </Card>

      {/* Change Password Dialog */}
      <Dialog open={passwordDialogOpen} onClose={() => setPasswordDialogOpen(false)} maxWidth="sm" fullWidth>
        <DialogTitle>Change Password</DialogTitle>
        <DialogContent>
          <TextField
            type="password"
            label="Current Password"
            value={currentPassword}
            onChange={(e) => setCurrentPassword(e.target.value)}
            fullWidth
            margin="normal"
            required
          />
          <TextField
            type="password"
            label="New Password"
            value={newPassword}
            onChange={(e) => setNewPassword(e.target.value)}
            fullWidth
            margin="normal"
            required
            helperText="Minimum 6 characters"
          />
          <TextField
            type="password"
            label="Confirm New Password"
            value={confirmPassword}
            onChange={(e) => setConfirmPassword(e.target.value)}
            fullWidth
            margin="normal"
            required
          />
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setPasswordDialogOpen(false)}>Cancel</Button>
          <Button 
            onClick={handleChangePassword} 
            variant="contained"
            disabled={passwordLoading || !currentPassword || !newPassword || !confirmPassword}
          >
            {passwordLoading ? <CircularProgress size={20} /> : 'Change Password'}
          </Button>
        </DialogActions>
      </Dialog>

      {/* Delete Account Dialog */}
      <Dialog open={deleteDialogOpen} onClose={() => setDeleteDialogOpen(false)} maxWidth="sm" fullWidth>
        <DialogTitle sx={{ color: 'error.main' }}>Delete Account</DialogTitle>
        <DialogContent>
          <Alert severity="error" sx={{ mb: 2 }}>
            This action cannot be undone. All your data will be permanently deleted.
          </Alert>
          <Typography variant="body2" sx={{ mb: 2 }}>
            Type <strong>DELETE</strong> to confirm account deletion:
          </Typography>
          <TextField
            label="Type DELETE to confirm"
            value={deleteConfirmation}
            onChange={(e) => setDeleteConfirmation(e.target.value)}
            fullWidth
            margin="normal"
          />
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setDeleteDialogOpen(false)}>Cancel</Button>
          <Button 
            onClick={handleDeleteAccount}
            color="error"
            variant="contained"
            disabled={deleteLoading || deleteConfirmation !== 'DELETE'}
          >
            {deleteLoading ? <CircularProgress size={20} /> : 'Delete Account'}
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
}