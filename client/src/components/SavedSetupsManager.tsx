import { useState, useEffect } from 'react'

import { type AnalysisResult } from '../services/tankSetupService'

interface SavedSetupsManagerProps {
  open: boolean
  onClose: () => void
  onLoadSetup: (setup: TankSetup) => void
  onLoadAndAnalyze: (setup: TankSetup) => Promise<void>
  onLoadWithAnalysis: (setup: TankSetup, analysis: AnalysisResult) => void
  currentSetup: TankSetup | null
  currentAnalysis: AnalysisResult | null
}
import {
  Box,
  Button,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  TextField,
  List,
  ListItem,
  IconButton,
  Typography,
  Alert,
  CircularProgress,
  Chip,
  Card,
  CardContent,
  Divider
} from '@mui/material'
import {
  Save,
  Delete,
  Upload,
  Close,
  Pets,
  Waves
} from '@mui/icons-material'
import { TankSetupService, type SavedTankSetup } from '../services/tankSetupService'
import { type TankSetup } from './TankSetupForm'
import { fishSpecies, coralSpecies } from '../data/aquariumData'

export function SavedSetupsManager({ open, onClose, onLoadSetup, onLoadAndAnalyze, onLoadWithAnalysis, currentSetup, currentAnalysis }: SavedSetupsManagerProps) {
  const [savedSetups, setSavedSetups] = useState<SavedTankSetup[]>([])
  const [loading, setLoading] = useState(false)
  const [saving, setSaving] = useState(false)
  const [error, setError] = useState('')
  const [success, setSuccess] = useState('')
  const [setupName, setSetupName] = useState('')
  const [showSaveForm, setShowSaveForm] = useState(false)

  useEffect(() => {
    if (open) {
      loadSetups()
    }
  }, [open])

  const loadSetups = async () => {
    setLoading(true)
    setError('')
    
    const { data, error: loadError } = await TankSetupService.getUserTankSetups()
    
    if (loadError) {
      setError(loadError)
    } else {
      setSavedSetups(data || [])
    }
    
    setLoading(false)
  }

  const handleSave = async () => {
    if (!setupName.trim()) {
      setError('Please enter a name for your tank setup')
      return
    }

    if (!currentSetup) {
      setError('No tank setup to save')
      return
    }

    setSaving(true)
    setError('')
    setSuccess('')

    const { error: saveError } = await TankSetupService.saveTankSetup(currentSetup, setupName.trim(), currentAnalysis || undefined)

    if (saveError) {
      setError(saveError)
    } else {
      setSuccess('Tank setup saved successfully!')
      setSetupName('')
      setShowSaveForm(false)
      loadSetups() // Reload the list
    }

    setSaving(false)
  }

  const handleLoad = async (savedSetup: SavedTankSetup) => {
    try {
      setLoading(true)
      const tankSetup = TankSetupService.savedToTankSetup(savedSetup)
      
      // Load the setup and trigger analysis
      await onLoadAndAnalyze(tankSetup)
      
      setSuccess(`Loaded and analyzed "${savedSetup.name}"`)
      setTimeout(() => onClose(), 1500) // Close after showing success
    } catch (error) {
      setError('Failed to load and analyze the tank setup')
    } finally {
      setLoading(false)
    }
  }

  const handleDelete = async (id: string, name: string) => {
    if (!confirm(`Are you sure you want to delete "${name}"?`)) {
      return
    }

    setError('')
    const { error: deleteError } = await TankSetupService.deleteTankSetup(id)

    if (deleteError) {
      setError(deleteError)
    } else {
      setSuccess(`Deleted "${name}"`)
      loadSetups() // Reload the list
    }
  }

  const getSpeciesName = (speciesId: string, isCoralName: boolean = false) => {
    const species = isCoralName 
      ? coralSpecies.find(c => c.id === speciesId)
      : fishSpecies.find(f => f.id === speciesId)
    return species?.name || speciesId
  }

  const formatSetupPreview = (setup: SavedTankSetup) => {
    const fishCount = setup.fish.length
    const coralCount = setup.corals.length
    return `${setup.volume}gal • ${fishCount} fish • ${coralCount} corals • ${setup.lighting}`
  }

  return (
    <Dialog open={open} onClose={onClose} maxWidth="md" fullWidth>
      <DialogTitle>
        <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
          <Typography variant="h6">My Tank Setups</Typography>
          <IconButton onClick={onClose} size="small">
            <Close />
          </IconButton>
        </Box>
      </DialogTitle>

      <DialogContent>
        {error && <Alert severity="error" sx={{ mb: 2 }}>{error}</Alert>}
        {success && <Alert severity="success" sx={{ mb: 2 }}>{success}</Alert>}

        {/* Save Current Setup */}
        {currentSetup && (
          <Card variant="outlined" sx={{ mb: 3 }}>
            <CardContent>
              <Typography variant="subtitle1" sx={{ mb: 2 }}>
                Save Current Setup
              </Typography>
              
              {!showSaveForm ? (
                <Button
                  variant="outlined"
                  startIcon={<Save />}
                  onClick={() => setShowSaveForm(true)}
                  disabled={!currentSetup?.fish?.length && !currentSetup?.corals?.length}
                >
                  Save This Setup
                </Button>
              ) : (
                <Box sx={{ display: 'flex', gap: 2, alignItems: 'center' }}>
                  <TextField
                    fullWidth
                    size="small"
                    label="Setup Name"
                    value={setupName}
                    onChange={(e) => setSetupName(e.target.value)}
                    placeholder="e.g., My 75g Reef Tank"
                  />
                  <Button
                    variant="contained"
                    onClick={handleSave}
                    disabled={saving || !setupName.trim()}
                    startIcon={saving ? <CircularProgress size={16} /> : <Save />}
                  >
                    Save
                  </Button>
                  <Button
                    variant="outlined"
                    onClick={() => {
                      setShowSaveForm(false)
                      setSetupName('')
                      setError('')
                    }}
                  >
                    Cancel
                  </Button>
                </Box>
              )}
            </CardContent>
          </Card>
        )}

        <Divider sx={{ my: 2 }} />

        {/* Saved Setups List */}
        <Typography variant="subtitle1" sx={{ mb: 2 }}>
          Saved Setups ({savedSetups.length})
        </Typography>

        {loading ? (
          <Box sx={{ display: 'flex', justifyContent: 'center', p: 3 }}>
            <CircularProgress />
          </Box>
        ) : savedSetups.length === 0 ? (
          <Box sx={{ textAlign: 'center', py: 4, color: 'text.secondary' }}>
            <Typography variant="body1">
              No saved tank setups yet.
            </Typography>
            <Typography variant="body2">
              Create your first setup and save it!
            </Typography>
          </Box>
        ) : (
          <List>
            {savedSetups.map((setup) => (
              <ListItem key={setup.id} divider>
                <Box sx={{ width: '100%' }}>
                  <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', mb: 1 }}>
                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                      <Typography variant="subtitle2">
                        {setup.name}
                      </Typography>
                      {setup.analysis_result && (
                        <Chip 
                          label={`Score: ${setup.analysis_result.score}`} 
                          size="small" 
                          color="primary"
                          variant="outlined"
                        />
                      )}
                    </Box>
                    <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 1, alignItems: 'center' }}>
                      {setup.analysis_result ? (
                        <Button
                          size="small"
                          variant="contained"
                          onClick={() => {
                            const tankSetup = TankSetupService.savedToTankSetup(setup)
                            onLoadWithAnalysis(tankSetup, setup.analysis_result!)
                            setSuccess(`Loaded "${setup.name}" with saved analysis`)
                            setTimeout(() => onClose(), 1000)
                          }}
                          disabled={loading}
                          startIcon={<Save />}
                          color="success"
                        >
                          Load with Results
                        </Button>
                      ) : null}
                      
                      <Button
                        size="small"
                        variant={setup.analysis_result ? "outlined" : "contained"}
                        onClick={() => handleLoad(setup)}
                        disabled={loading}
                        startIcon={<Upload />}
                      >
                        Load & Analyze
                      </Button>
                      
                      <Button
                        size="small"
                        variant="outlined"
                        onClick={() => {
                          const tankSetup = TankSetupService.savedToTankSetup(setup)
                          onLoadSetup(tankSetup)
                          setSuccess(`Loaded "${setup.name}"`)
                          setTimeout(() => onClose(), 1000)
                        }}
                        disabled={loading}
                      >
                        Load Only
                      </Button>
                      
                      <IconButton
                        size="small"
                        onClick={() => handleDelete(setup.id, setup.name)}
                        color="error"
                        title="Delete this setup"
                        disabled={loading}
                      >
                        <Delete />
                      </IconButton>
                    </Box>
                  </Box>
                  
                  <Typography variant="body2" color="text.secondary" sx={{ mb: 1 }}>
                    {formatSetupPreview(setup)}
                  </Typography>
                  
                  <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 1, alignItems: 'center' }}>
                    {setup.fish.map((fish) => (
                      <Chip
                        key={fish.species_id}
                        label={`${fish.quantity}× ${getSpeciesName(fish.species_id)}`}
                        size="small"
                        icon={<Pets />}
                        variant="outlined"
                        color="primary"
                      />
                    ))}
                    {setup.corals.map((coral) => (
                      <Chip
                        key={coral.species_id}
                        label={`${coral.quantity}× ${getSpeciesName(coral.species_id, true)}`}
                        size="small"
                        icon={<Waves />}
                        variant="outlined"
                        color="secondary"
                      />
                    ))}
                  </Box>
                  
                  <Typography variant="caption" color="text.secondary" sx={{ mt: 1, display: 'block' }}>
                    Created {new Date(setup.created_at).toLocaleDateString()}
                  </Typography>
                </Box>
              </ListItem>
            ))}
          </List>
        )}
      </DialogContent>

      <DialogActions>
        <Button onClick={onClose}>Close</Button>
      </DialogActions>
    </Dialog>
  )
}