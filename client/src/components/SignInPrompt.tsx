import {
  Paper,
  Typography,
  Box,
  Button,
  Card,
  CardContent
} from '@mui/material'
import { Login, Security, Save, Analytics } from '@mui/icons-material'

interface SignInPromptProps {
  onSignInClick: () => void
}

export function SignInPrompt({ onSignInClick }: SignInPromptProps) {
  return (
    <Paper elevation={2} sx={{ p: 4, textAlign: 'center', minHeight: 400 }}>
      <Box sx={{ mb: 4 }}>
        <Security sx={{ fontSize: 64, color: 'primary.main', mb: 2 }} />
        <Typography variant="h5" component="h2" sx={{ mb: 2 }}>
          Sign In to Unlock Full Features
        </Typography>
        <Typography variant="body1" color="text.secondary" sx={{ mb: 4, maxWidth: 500, mx: 'auto' }}>
          Create a free account to analyze your tank setups, save your configurations, 
          and get personalized AI recommendations for your reef aquarium.
        </Typography>
      </Box>

      <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2, mb: 4, maxWidth: 400, mx: 'auto' }}>
        <Card variant="outlined" sx={{ p: 2 }}>
          <CardContent sx={{ py: 1 }}>
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
              <Analytics color="primary" />
              <Box sx={{ textAlign: 'left' }}>
                <Typography variant="subtitle2">AI Analysis & Recommendations</Typography>
                <Typography variant="body2" color="text.secondary">
                  Get expert advice on your tank setup
                </Typography>
              </Box>
            </Box>
          </CardContent>
        </Card>

        <Card variant="outlined" sx={{ p: 2 }}>
          <CardContent sx={{ py: 1 }}>
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
              <Save color="primary" />
              <Box sx={{ textAlign: 'left' }}>
                <Typography variant="subtitle2">Save & Load Tank Setups</Typography>
                <Typography variant="body2" color="text.secondary">
                  Build a library of your aquarium configurations
                </Typography>
              </Box>
            </Box>
          </CardContent>
        </Card>

        <Card variant="outlined" sx={{ p: 2 }}>
          <CardContent sx={{ py: 1 }}>
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
              <Security color="primary" />
              <Box sx={{ textAlign: 'left' }}>
                <Typography variant="subtitle2">Secure & Private</Typography>
                <Typography variant="body2" color="text.secondary">
                  Your tank data is protected and private
                </Typography>
              </Box>
            </Box>
          </CardContent>
        </Card>
      </Box>

      <Button
        variant="contained"
        size="large"
        startIcon={<Login />}
        onClick={onSignInClick}
        sx={{ py: 1.5, px: 4 }}
      >
        Sign In / Create Account
      </Button>
      
      <Typography variant="body2" color="text.secondary" sx={{ mt: 2 }}>
        It's free and takes less than a minute!
      </Typography>
    </Paper>
  )
}