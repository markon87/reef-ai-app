import { useState } from 'react'
import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  TextField,
  Button,
  Alert,
  Box,
  Typography,
  Link,
  CircularProgress,
  Divider
} from '@mui/material'
import { useAuth } from '../contexts/AuthContext'

interface AuthDialogProps {
  open: boolean
  onClose: () => void
  initialMode?: 'signin' | 'signup' | 'reset'
}

export function AuthDialog({ open, onClose, initialMode = 'signin' }: AuthDialogProps) {
  const [mode, setMode] = useState<'signin' | 'signup' | 'reset'>(initialMode)
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [displayName, setDisplayName] = useState('')
  const [confirmPassword, setConfirmPassword] = useState('')
  const [error, setError] = useState('')
  const [success, setSuccess] = useState('')
  const [loading, setLoading] = useState(false)

  const { signIn, signUp, resetPassword } = useAuth()

  const handleClose = () => {
    setEmail('')
    setPassword('')
    setDisplayName('')
    setConfirmPassword('')
    setError('')
    setSuccess('')
    setLoading(false)
    onClose()
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError('')
    setSuccess('')
    setLoading(true)

    try {
      if (mode === 'signin') {
        const { error } = await signIn(email, password)
        if (error) {
          setError(error.message)
        } else {
          handleClose()
        }
      } else if (mode === 'signup') {
        if (password !== confirmPassword) {
          setError('Passwords do not match')
          return
        }
        if (password.length < 6) {
          setError('Password must be at least 6 characters long')
          return
        }
        
        const { error } = await signUp(email, password, displayName)
        if (error) {
          setError(error.message)
        } else {
          setSuccess('Please check your email for a confirmation link!')
          setMode('signin')
        }
      } else if (mode === 'reset') {
        const { error } = await resetPassword(email)
        if (error) {
          setError(error.message)
        } else {
          setSuccess('Password reset email sent! Check your inbox.')
          setMode('signin')
        }
      }
    } catch (err) {
      setError('An unexpected error occurred')
    } finally {
      setLoading(false)
    }
  }

  const switchMode = (newMode: 'signin' | 'signup' | 'reset') => {
    setMode(newMode)
    setError('')
    setSuccess('')
  }

  return (
    <Dialog open={open} onClose={handleClose} maxWidth="sm" fullWidth>
      <form onSubmit={handleSubmit}>
        <DialogTitle>
          {mode === 'signin' && 'Sign In to Reef Tank Builder'}
          {mode === 'signup' && 'Create Your Account'}
          {mode === 'reset' && 'Reset Password'}
        </DialogTitle>
        
        <DialogContent>
          <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2, pt: 1 }}>
            {error && <Alert severity="error">{error}</Alert>}
            {success && <Alert severity="success">{success}</Alert>}
            
            {mode === 'signup' && (
              <TextField
                fullWidth
                label="Display Name"
                value={displayName}
                onChange={(e) => setDisplayName(e.target.value)}
                placeholder="How should we call you?"
              />
            )}
            
            <TextField
              fullWidth
              label="Email"
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
              autoComplete="email"
            />
            
            {mode !== 'reset' && (
              <TextField
                fullWidth
                label="Password"
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
                autoComplete={mode === 'signin' ? 'current-password' : 'new-password'}
              />
            )}
            
            {mode === 'signup' && (
              <TextField
                fullWidth
                label="Confirm Password"
                type="password"
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                required
                autoComplete="new-password"
              />
            )}
            
            <Divider sx={{ my: 1 }} />
            
            {/* Mode switching links */}
            <Box sx={{ textAlign: 'center' }}>
              {mode === 'signin' && (
                <>
                  <Typography variant="body2" color="text.secondary">
                    Don't have an account?{' '}
                    <Link 
                      component="button" 
                      type="button"
                      onClick={() => switchMode('signup')}
                      sx={{ textDecoration: 'none' }}
                    >
                      Sign up
                    </Link>
                  </Typography>
                  <Typography variant="body2" color="text.secondary" sx={{ mt: 1 }}>
                    <Link 
                      component="button" 
                      type="button"
                      onClick={() => switchMode('reset')}
                      sx={{ textDecoration: 'none' }}
                    >
                      Forgot password?
                    </Link>
                  </Typography>
                </>
              )}
              
              {mode === 'signup' && (
                <Typography variant="body2" color="text.secondary">
                  Already have an account?{' '}
                  <Link 
                    component="button" 
                    type="button"
                    onClick={() => switchMode('signin')}
                    sx={{ textDecoration: 'none' }}
                  >
                    Sign in
                  </Link>
                </Typography>
              )}
              
              {mode === 'reset' && (
                <Typography variant="body2" color="text.secondary">
                  Remember your password?{' '}
                  <Link 
                    component="button" 
                    type="button"
                    onClick={() => switchMode('signin')}
                    sx={{ textDecoration: 'none' }}
                  >
                    Sign in
                  </Link>
                </Typography>
              )}
            </Box>
          </Box>
        </DialogContent>
        
        <DialogActions sx={{ p: 3, pt: 1 }}>
          <Button onClick={handleClose} disabled={loading}>
            Cancel
          </Button>
          <Button 
            type="submit" 
            variant="contained" 
            disabled={loading || !email || (mode !== 'reset' && !password)}
            startIcon={loading && <CircularProgress size={20} />}
          >
            {loading ? 'Processing...' : (
              mode === 'signin' ? 'Sign In' :
              mode === 'signup' ? 'Create Account' :
              'Send Reset Email'
            )}
          </Button>
        </DialogActions>
      </form>
    </Dialog>
  )
}