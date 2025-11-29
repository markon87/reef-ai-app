import { useState } from 'react';
import { Typography, Box, Button, Container, alpha, useTheme, IconButton } from '@mui/material';
import { Login, LightMode, DarkMode } from '@mui/icons-material';
import { useAuth } from '../contexts/AuthContext';
import { useThemeMode } from '../contexts/ThemeContext';
import { UserMenu } from './UserMenu';
import { AuthDialog } from './AuthDialog';

interface LayoutProps {
  children: React.ReactNode;
}

export const Layout = ({ children }: LayoutProps) => {
  const [authDialogOpen, setAuthDialogOpen] = useState(false);
  const { user } = useAuth();
  const { mode, toggleTheme } = useThemeMode();
  const theme = useTheme();

  return (
    <Box sx={{ 
      minHeight: '100vh',
      display: 'flex',
      flexDirection: 'column',
      width: '100vw',
      margin: 0,
      padding: 0,
      boxSizing: 'border-box',
      background: `linear-gradient(135deg, 
        ${alpha(theme.palette.primary.main, 0.05)} 0%, 
        ${alpha(theme.palette.secondary.main, 0.05)} 50%, 
        ${alpha(theme.palette.primary.main, 0.05)} 100%
      )`,
    }}>
      {/* Header */}
      <Box
        sx={{
          position: 'sticky',
          top: 0,
          zIndex: 1000,
          backgroundColor: alpha(theme.palette.background.paper, 0.95),
          backdropFilter: 'blur(10px)',
          borderBottom: `1px solid ${alpha(theme.palette.divider, 0.1)}`,
        }}
      >
        <Container maxWidth="lg">
          <Box
            sx={{
              display: 'flex',
              justifyContent: 'space-between',
              alignItems: 'center',
              py: 2,
            }}
          >
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
              <Box
                sx={{
                  width: 40,
                  height: 40,
                  borderRadius: '50%',
                  background: `linear-gradient(135deg, ${theme.palette.primary.main}, ${theme.palette.secondary.main})`,
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  color: 'white',
                  fontSize: '1.5rem',
                  fontWeight: 'bold',
                }}
              >
                🐠
              </Box>
              <Typography
                variant="h5"
                sx={{
                  fontWeight: 700,
                  background: `linear-gradient(135deg, ${theme.palette.primary.main}, ${theme.palette.secondary.main})`,
                  backgroundClip: 'text',
                  WebkitBackgroundClip: 'text',
                  WebkitTextFillColor: 'transparent',
                }}
              >
                ReefAI
              </Typography>
            </Box>
          
            {/* Theme Toggle & Auth Section */}
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
              {/* Theme Toggle Button */}
              <IconButton
                onClick={toggleTheme}
                sx={{
                  color: theme.palette.primary.main,
                  '&:hover': {
                    backgroundColor: alpha(theme.palette.primary.main, 0.1),
                  },
                }}
              >
                {mode === 'light' ? <DarkMode /> : <LightMode />}
              </IconButton>
              
              {/* Auth Section */}
              {user ? (
                <UserMenu />
              ) : (
                <Button
                  variant="contained"
                  startIcon={<Login />}
                  onClick={() => setAuthDialogOpen(true)}
                  sx={{
                    borderRadius: 3,
                    px: 4,
                    py: 1.5,
                    background: `linear-gradient(135deg, ${theme.palette.primary.main}, ${theme.palette.secondary.main})`,
                    '&:hover': {
                      background: `linear-gradient(135deg, ${theme.palette.primary.dark}, ${theme.palette.secondary.dark})`,
                    },
                  }}
                >
                  Sign In
                </Button>
              )}
            </Box>
          </Box>
        </Container>
      </Box>

      {/* Main Content */}
      <Container maxWidth="lg" sx={{ flex: 1, py: { xs: 3, md: 4 } }}>
        {children}
      </Container>

      {/* Footer */}
      <Box
        sx={{
          backgroundColor: alpha(theme.palette.background.paper, 0.8),
          borderTop: `1px solid ${alpha(theme.palette.divider, 0.1)}`,
          py: 4,
        }}
      >
        <Container maxWidth="lg">
          <Box
            sx={{
              display: 'flex',
              justifyContent: 'space-between',
              alignItems: 'center',
              flexWrap: 'wrap',
              gap: 2,
            }}
          >
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
              <Box
                sx={{
                  width: 32,
                  height: 32,
                  borderRadius: '50%',
                  background: `linear-gradient(135deg, ${theme.palette.primary.main}, ${theme.palette.secondary.main})`,
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  color: 'white',
                  fontSize: '1.2rem',
                }}
              >
                🐠
              </Box>
              <Typography variant="h6" sx={{ fontWeight: 600 }}>
                ReefAI
              </Typography>
            </Box>
            <Typography variant="body2" color="text.secondary">
              © 2025 ReefAI. Built with ❤️ for the reef community.
            </Typography>
          </Box>
        </Container>
      </Box>

      {/* Auth Dialog */}
      <AuthDialog 
        open={authDialogOpen} 
        onClose={() => setAuthDialogOpen(false)} 
      />
    </Box>
  );
};