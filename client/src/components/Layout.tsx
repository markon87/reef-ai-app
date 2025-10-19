import { useState } from 'react';
import { AppBar, Toolbar, Typography, Box, Button } from '@mui/material';
import { Waves, Login } from '@mui/icons-material';
import { useAuth } from '../contexts/AuthContext';
import { UserMenu } from './UserMenu';
import { AuthDialog } from './AuthDialog';

interface LayoutProps {
  children: React.ReactNode;
}

export const Layout = ({ children }: LayoutProps) => {
  const [authDialogOpen, setAuthDialogOpen] = useState(false);
  const { user } = useAuth();

  return (
    <Box sx={{ 
      minHeight: '100vh',
      display: 'flex',
      flexDirection: 'column',
      width: '100vw',
      margin: 0,
      padding: 0,
      boxSizing: 'border-box'
    }}>
      {/* Header */}
      <AppBar 
        position="static" 
        elevation={2} 
        sx={{ 
          width: '100vw',
          margin: 0,
          '& .MuiContainer-root': {
            maxWidth: 'none !important',
            width: '100%'
          }
        }}
      >
        <Toolbar sx={{ 
          width: '100%',
          maxWidth: 'none !important',
          margin: 0,
          padding: 0,
          px: { xs: 2, sm: 3, md: 4 },
          '&.MuiToolbar-root': {
            maxWidth: 'none !important'
          }
        }}>
          <Waves sx={{ mr: 2 }} />
          <Typography variant="h6" component="div" sx={{ flexGrow: 1 }}>
            🐠 Reef AI - Aquarium Intelligence
          </Typography>
          
          {/* Auth Section */}
          {user ? (
            <UserMenu />
          ) : (
            <Button
              color="inherit"
              startIcon={<Login />}
              onClick={() => setAuthDialogOpen(true)}
            >
              Sign In
            </Button>
          )}
        </Toolbar>
      </AppBar>

      {/* Main Content */}
      <Box sx={{ 
        flex: 1,
        width: '100vw',
        maxWidth: 'none !important',
        margin: 0,
        px: { xs: 2, sm: 3, md: 4 },
        py: { xs: 2, sm: 3, md: 4 },
        boxSizing: 'border-box'
      }}>
        {children}
      </Box>

      {/* Footer */}
      <Box 
        component="footer" 
        sx={{ 
          py: 2, 
          px: { xs: 2, sm: 3, md: 4 }, 
          backgroundColor: 'background.paper',
          borderTop: 1,
          borderColor: 'divider',
          width: '100%'
        }}
      >
        <Typography variant="body2" color="text.secondary" align="center">
          © 2025 Reef AI - Your Aquarium Assistant
        </Typography>
      </Box>

      {/* Auth Dialog */}
      <AuthDialog 
        open={authDialogOpen} 
        onClose={() => setAuthDialogOpen(false)} 
      />
    </Box>
  );
};