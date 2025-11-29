import { useState } from 'react'
import {
  Box,
  Container,
  Typography,
  Button,
  Card,
  CardContent,
  IconButton,
  useTheme,
  alpha,
} from '@mui/material'
import {
  Analytics,
  Pets,
  Security,
  Speed,
  GitHub,
  LightMode,
  DarkMode,
} from '@mui/icons-material'
import { AuthDialog } from './AuthDialog'
import { useThemeMode } from '../contexts/ThemeContext'

export const LandingPage = () => {
  const [authDialogOpen, setAuthDialogOpen] = useState(false)
  const { mode, toggleTheme } = useThemeMode()
  const theme = useTheme()

  const features = [
    {
      icon: <Analytics />,
      title: 'AI-Powered Analysis',
      description: 'Get expert-level tank compatibility analysis using advanced AI technology trained on marine biology data.'
    },
    {
      icon: <Pets />,
      title: 'Species Database',
      description: 'Access comprehensive databases of fish and coral species with compatibility ratings and care requirements.'
    },
    {
      icon: <Security />,
      title: 'Save Your Setups',
      description: 'Securely save and manage multiple tank configurations with detailed analysis results.'
    },
    {
      icon: <Speed />,
      title: 'Instant Results',
      description: 'Get immediate feedback on your reef tank setup with detailed breakdowns and recommendations.'
    }
  ]

  return (
    <Box
      sx={{
        minHeight: '100vh',
        background: `linear-gradient(135deg, 
          ${alpha(theme.palette.primary.main, 0.05)} 0%, 
          ${alpha(theme.palette.secondary.main, 0.05)} 50%, 
          ${alpha(theme.palette.primary.main, 0.05)} 100%
        )`,
      }}
    >
      {/* Navigation */}
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
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
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
              <Button
                variant="contained"
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
                Get Started
              </Button>
            </Box>
          </Box>
        </Container>
      </Box>

      {/* Hero Section */}
      <Container maxWidth="lg">
        <Box sx={{ py: { xs: 6, md: 12 }, display: 'flex', flexDirection: { xs: 'column', md: 'row' }, gap: 6, alignItems: 'center' }}>
          <Box sx={{ flex: 1 }}>
            <Typography
              variant="h2"
              component="h1"
              sx={{
                fontWeight: 800,
                fontSize: { xs: '2.5rem', md: '3.5rem' },
                mb: 3,
                background: `linear-gradient(135deg, ${theme.palette.primary.main}, ${theme.palette.secondary.main})`,
                backgroundClip: 'text',
                WebkitBackgroundClip: 'text',
                WebkitTextFillColor: 'transparent',
              }}
            >
              Build the Perfect
              <br />
              Reef Aquarium
            </Typography>
            <Typography
              variant="h5"
              sx={{
                mb: 4,
                color: theme.palette.text.secondary,
                fontWeight: 400,
                lineHeight: 1.6,
              }}
            >
              AI-powered compatibility analysis for marine aquariums. Get expert recommendations 
              for fish, corals, equipment, and water parameters.
            </Typography>
            <Box sx={{ display: 'flex', gap: 2, flexWrap: 'wrap' }}>
              <Button
                variant="contained"
                size="large"
                onClick={() => setAuthDialogOpen(true)}
                sx={{
                  borderRadius: 3,
                  px: 4,
                  py: 1.5,
                  fontSize: '1.1rem',
                  background: `linear-gradient(135deg, ${theme.palette.primary.main}, ${theme.palette.secondary.main})`,
                  '&:hover': {
                    background: `linear-gradient(135deg, ${theme.palette.primary.dark}, ${theme.palette.secondary.dark})`,
                  },
                }}
              >
                Start Analyzing
              </Button>
              <Button
                variant="outlined"
                size="large"
                sx={{
                  borderRadius: 3,
                  px: 4,
                  py: 1.5,
                  fontSize: '1.1rem',
                  borderColor: theme.palette.primary.main,
                  color: theme.palette.primary.main,
                  '&:hover': {
                    backgroundColor: alpha(theme.palette.primary.main, 0.1),
                  },
                }}
              >
                Learn More
              </Button>
            </Box>
          </Box>
          <Box sx={{ flex: 1 }}>
            <Box
              sx={{
                position: 'relative',
                borderRadius: 4,
                overflow: 'hidden',
                background: `linear-gradient(135deg, 
                  ${alpha(theme.palette.primary.main, 0.1)}, 
                  ${alpha(theme.palette.secondary.main, 0.1)}
                )`,
                p: 4,
                textAlign: 'center',
                minHeight: 400,
                display: 'flex',
                flexDirection: 'column',
                justifyContent: 'center',
              }}
            >
              <Typography variant="h3" sx={{ mb: 2, textAlign: 'center' }}>🐠🐟🦀</Typography>
              <Typography variant="h6" color="text.secondary" sx={{ mb: 2, textAlign: 'center' }}>
                Intelligent Tank Analysis
              </Typography>
              <Typography variant="body1" color="text.secondary" sx={{ textAlign: 'center' }}>
                Upload your tank specifications and get instant compatibility scores, 
                equipment recommendations, and care guidelines.
              </Typography>
              <Box
                sx={{
                  position: 'absolute',
                  top: 20,
                  right: 20,
                  width: 60,
                  height: 60,
                  borderRadius: '50%',
                  background: alpha(theme.palette.success.main, 0.2),
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                }}
              >
                <Typography variant="h6" color="success.main" fontWeight="bold">
                  AI
                </Typography>
              </Box>
            </Box>
          </Box>
        </Box>
      </Container>

      {/* Features Section */}
      <Box sx={{ backgroundColor: alpha(theme.palette.background.paper, 0.8), py: 8 }}>
        <Container maxWidth="lg">
          <Typography
            variant="h3"
            component="h2"
            textAlign="center"
            sx={{
              mb: 2,
              fontWeight: 700,
              background: `linear-gradient(135deg, ${theme.palette.primary.main}, ${theme.palette.secondary.main})`,
              backgroundClip: 'text',
              WebkitBackgroundClip: 'text',
              WebkitTextFillColor: 'transparent',
            }}
          >
            Why Choose ReefAI?
          </Typography>
          <Typography
            variant="h6"
            textAlign="center"
            color="text.secondary"
            sx={{ mb: 6, maxWidth: 600, mx: 'auto' }}
          >
            Advanced AI technology meets decades of marine biology expertise
          </Typography>

          <Box sx={{ 
            display: 'grid', 
            gridTemplateColumns: { xs: '1fr', sm: 'repeat(2, 1fr)', md: 'repeat(4, 1fr)' }, 
            gap: 4 
          }}>
            {features.map((feature, index) => (
              <Box key={index}>
                <Card
                  sx={{
                    height: '100%',
                    borderRadius: 3,
                    border: `1px solid ${alpha(theme.palette.divider, 0.1)}`,
                    transition: 'all 0.3s ease-in-out',
                    '&:hover': {
                      transform: 'translateY(-4px)',
                      boxShadow: `0 12px 24px ${alpha(theme.palette.primary.main, 0.15)}`,
                    },
                  }}
                >
                  <CardContent sx={{ p: 3, textAlign: 'center' }}>
                    <Box
                      sx={{
                        width: 60,
                        height: 60,
                        borderRadius: '50%',
                        background: `linear-gradient(135deg, ${alpha(theme.palette.primary.main, 0.1)}, ${alpha(theme.palette.secondary.main, 0.1)})`,
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        mx: 'auto',
                        mb: 2,
                        color: theme.palette.primary.main,
                      }}
                    >
                      {feature.icon}
                    </Box>
                    <Typography variant="h6" sx={{ mb: 1, fontWeight: 600 }}>
                      {feature.title}
                    </Typography>
                    <Typography variant="body2" color="text.secondary" sx={{ lineHeight: 1.6 }}>
                      {feature.description}
                    </Typography>
                  </CardContent>
                </Card>
              </Box>
            ))}
          </Box>
        </Container>
      </Box>

      {/* CTA Section */}
      <Container maxWidth="lg">
        <Box
          sx={{
            py: 8,
            textAlign: 'center',
            borderRadius: 4,
            background: `linear-gradient(135deg, 
              ${alpha(theme.palette.primary.main, 0.05)}, 
              ${alpha(theme.palette.secondary.main, 0.05)}
            )`,
            mx: 2,
            my: 6,
            px: 4,
          }}
        >
          <Typography
            variant="h4"
            component="h2"
            sx={{
              mb: 2,
              fontWeight: 700,
              background: `linear-gradient(135deg, ${theme.palette.primary.main}, ${theme.palette.secondary.main})`,
              backgroundClip: 'text',
              WebkitBackgroundClip: 'text',
              WebkitTextFillColor: 'transparent',
            }}
          >
            Ready to Build Your Dream Reef?
          </Typography>
          <Typography variant="h6" color="text.secondary" sx={{ mb: 4, maxWidth: 500, mx: 'auto' }}>
            Join thousands of aquarists using AI to create thriving marine ecosystems
          </Typography>
          <Button
            variant="contained"
            size="large"
            onClick={() => setAuthDialogOpen(true)}
            sx={{
              borderRadius: 3,
              px: 6,
              py: 2,
              fontSize: '1.2rem',
              background: `linear-gradient(135deg, ${theme.palette.primary.main}, ${theme.palette.secondary.main})`,
              '&:hover': {
                background: `linear-gradient(135deg, ${theme.palette.primary.dark}, ${theme.palette.secondary.dark})`,
              },
            }}
          >
            Get Started Free
          </Button>
        </Box>
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
            <IconButton
              href="https://github.com/markon87/reef-ai-app"
              target="_blank"
              sx={{ color: theme.palette.text.secondary }}
            >
              <GitHub />
            </IconButton>
          </Box>
        </Container>
      </Box>

      {/* Auth Dialog */}
      <AuthDialog 
        open={authDialogOpen} 
        onClose={() => setAuthDialogOpen(false)} 
      />
    </Box>
  )
}