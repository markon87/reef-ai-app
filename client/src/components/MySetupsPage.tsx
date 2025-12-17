import { useState, useEffect } from 'react';
import {
  Box,
  Button,
  Typography,
  Alert,
  CircularProgress,
  Chip,
  Card,
  CardContent,
  CardActions,
  Divider,
  IconButton,
  Paper
} from '@mui/material';
import {
  Delete,
  Upload,
  Pets,
  Waves,
  Analytics,
  CalendarToday
} from '@mui/icons-material';
import { TankSetupService, type SavedTankSetup } from '../services/tankSetupService';
import { type TankSetup } from './TankSetupForm';
import { type AnalysisResult } from '../services/tankSetupService';
import { fishSpecies, coralSpecies } from '../data/aquariumData';
import { useUnits } from '../contexts/UnitsContext';

interface MySetupsPageProps {
  onLoadSetup: (setup: TankSetup) => void;
  onLoadAndAnalyze: (setup: TankSetup) => Promise<void>;
  onLoadWithAnalysis: (setup: TankSetup, analysis: AnalysisResult) => void;
  onNavigateToSetup: () => void;
}

export function MySetupsPage({ 
  onLoadSetup, 
  onLoadAndAnalyze, 
  onLoadWithAnalysis, 
  onNavigateToSetup 
}: MySetupsPageProps) {
  const { formatVolume, getVolumeUnit, formatTemperature, getTemperatureUnit } = useUnits();
  const [savedSetups, setSavedSetups] = useState<SavedTankSetup[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  useEffect(() => {
    loadSavedSetups();
  }, []);

  const loadSavedSetups = async () => {
    try {
      setLoading(true);
      setError('');
      const result = await TankSetupService.getUserTankSetups();
      if (result.error) {
        setError(result.error);
      } else {
        setSavedSetups(result.data || []);
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to load saved setups');
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (id: string) => {
    if (!window.confirm('Are you sure you want to delete this setup?')) return;
    
    try {
      const result = await TankSetupService.deleteTankSetup(id);
      if (result.error) {
        setError(result.error);
      } else {
        await loadSavedSetups();
        setSuccess('Setup deleted successfully');
        setTimeout(() => setSuccess(''), 3000);
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to delete setup');
    }
  };

  const convertToTankSetup = (savedSetup: SavedTankSetup): TankSetup => {
    return {
      volume: savedSetup.volume,
      lighting: savedSetup.lighting,
      filtration: savedSetup.filtration,
      fish: savedSetup.fish.map(f => ({ species: f.species_id, quantity: f.quantity })),
      corals: savedSetup.corals.map(c => ({ species: c.species_id, quantity: c.quantity })),
      hasProteinSkimmer: savedSetup.has_protein_skimmer,
      hasHeater: savedSetup.has_heater,
      hasWavemaker: savedSetup.has_wavemaker,
      waterParams: {
        ph: savedSetup.water_ph || undefined,
        salinity: savedSetup.water_salinity || undefined,
        temperature: savedSetup.water_temperature || undefined
      }
    };
  };

  const handleLoadSetup = (setup: SavedTankSetup) => {
    const tankSetup = convertToTankSetup(setup);
    onLoadSetup(tankSetup);
    onNavigateToSetup();
    setSuccess('Setup loaded successfully');
    setTimeout(() => setSuccess(''), 3000);
  };

  const handleLoadAndAnalyze = async (setup: SavedTankSetup) => {
    try {
      const tankSetup = convertToTankSetup(setup);
      await onLoadAndAnalyze(tankSetup);
      onNavigateToSetup();
      setSuccess('Setup loaded and analyzed successfully');
      setTimeout(() => setSuccess(''), 3000);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to analyze setup');
    }
  };

  const handleLoadWithAnalysis = (setup: SavedTankSetup) => {
    if (setup.analysis_result) {
      const tankSetup = convertToTankSetup(setup);
      onLoadWithAnalysis(tankSetup, setup.analysis_result);
      onNavigateToSetup();
      setSuccess('Setup and analysis loaded successfully');
      setTimeout(() => setSuccess(''), 3000);
    }
  };

  const getSpeciesName = (speciesId: string, type: 'fish' | 'coral') => {
    const data = type === 'fish' ? fishSpecies : coralSpecies;
    return data.find(s => s.id === speciesId)?.name || speciesId;
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString();
  };

  return (
    <Box sx={{ maxWidth: 1200, mx: 'auto', p: 3 }}>
      <Box sx={{ mb: 4 }}>
        <Typography variant="h4" component="h1" gutterBottom>
          My Tank Setups
        </Typography>
        <Typography variant="body1" color="text.secondary">
          Manage your saved reef tank configurations and analyses
        </Typography>
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
        <Box sx={{ display: 'flex', justifyContent: 'center', py: 8 }}>
          <CircularProgress />
        </Box>
      ) : savedSetups.length === 0 ? (
        <Paper sx={{ p: 6, textAlign: 'center' }}>
          <Typography variant="h6" color="text.secondary" gutterBottom>
            No saved setups found
          </Typography>
          <Typography variant="body2" color="text.secondary" sx={{ mb: 3 }}>
            Create and save your first tank setup to get started!
          </Typography>
          <Button 
            variant="contained" 
            onClick={onNavigateToSetup}
            sx={{ px: 4 }}
          >
            Create Setup
          </Button>
        </Paper>
      ) : (
        <Box sx={{ 
          display: 'grid',
          gridTemplateColumns: { 
            xs: '1fr', 
            md: '1fr',
            xl: 'repeat(2, 1fr)'
          },
          gap: 3,
          '@media (max-width: 1366px)': {
            gridTemplateColumns: '1fr'
          }
        }}>
          {savedSetups.map((setup) => (
            <Card 
              key={setup.id}
              sx={{ 
                height: '100%', 
                display: 'flex', 
                flexDirection: 'column',
                '&:hover': { 
                  boxShadow: 6,
                  transform: 'translateY(-2px)',
                  transition: 'all 0.2s ease-in-out'
                }
              }}
            >
                <CardContent sx={{ flexGrow: 1 }}>
                  <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
                    <Typography variant="h6" component="h3" sx={{ flexGrow: 1 }}>
                      {setup.name}
                    </Typography>
                    <IconButton 
                      size="small" 
                      color="error" 
                      onClick={() => handleDelete(setup.id)}
                    >
                      <Delete />
                    </IconButton>
                  </Box>

                  <Box sx={{ display: 'flex', alignItems: 'center', mb: 1 }}>
                    <CalendarToday sx={{ fontSize: 16, mr: 1, color: 'text.secondary' }} />
                    <Typography variant="caption" color="text.secondary">
                      Saved: {formatDate(setup.created_at)}
                    </Typography>
                  </Box>

                  <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
                    Tank: {formatVolume(setup.volume)} {getVolumeUnit()} • {setup.lighting} lighting
                  </Typography>

                  {/* Fish Species */}
                  {setup.fish && setup.fish.length > 0 && (
                    <Box sx={{ mb: 2 }}>
                      <Box sx={{ display: 'flex', alignItems: 'center', mb: 1 }}>
                        <Pets sx={{ fontSize: 16, mr: 1, color: 'primary.main' }} />
                        <Typography variant="caption" color="primary.main" fontWeight="medium">
                          Fish ({setup.fish.length})
                        </Typography>
                      </Box>
                      <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 0.5 }}>
                        {setup.fish.slice(0, 3).map((fish, index) => (
                          <Chip 
                            key={index} 
                            label={`${fish.quantity}x ${getSpeciesName(fish.species_id, 'fish')}`}
                            size="small" 
                            variant="outlined"
                            color="primary"
                          />
                        ))}
                        {setup.fish.length > 3 && (
                          <Chip 
                            label={`+${setup.fish.length - 3} more`} 
                            size="small" 
                            variant="outlined"
                            color="primary"
                          />
                        )}
                      </Box>
                    </Box>
                  )}

                  {/* Coral Species */}
                  {setup.corals && setup.corals.length > 0 && (
                    <Box sx={{ mb: 2 }}>
                      <Box sx={{ display: 'flex', alignItems: 'center', mb: 1 }}>
                        <Waves sx={{ fontSize: 16, mr: 1, color: 'secondary.main' }} />
                        <Typography variant="caption" color="secondary.main" fontWeight="medium">
                          Corals ({setup.corals.length})
                        </Typography>
                      </Box>
                      <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 0.5 }}>
                        {setup.corals.slice(0, 3).map((coral, index) => (
                          <Chip 
                            key={index} 
                            label={`${coral.quantity}x ${getSpeciesName(coral.species_id, 'coral')}`}
                            size="small" 
                            variant="outlined"
                            color="secondary"
                          />
                        ))}
                        {setup.corals.length > 3 && (
                          <Chip 
                            label={`+${setup.corals.length - 3} more`} 
                            size="small" 
                            variant="outlined"
                            color="secondary"
                          />
                        )}
                      </Box>
                    </Box>
                  )}

                  {/* Analysis Status */}
                  {setup.analysis_result && (
                    <Box sx={{ display: 'flex', alignItems: 'center', mt: 2 }}>
                      <Analytics sx={{ fontSize: 16, mr: 1, color: 'success.main' }} />
                      <Chip 
                        label={`Score: ${setup.analysis_result.score}`} 
                        size="small" 
                        color="success"
                        variant="outlined"
                      />
                    </Box>
                  )}
                </CardContent>

                <Divider />

                <CardActions sx={{ p: 2, pt: 1.5, display: 'flex', flexDirection: 'column', gap: 1 }}>
                  <Button 
                    fullWidth
                    size="small" 
                    variant="outlined"
                    onClick={() => handleLoadSetup(setup)}
                    startIcon={<Upload />}
                  >
                    Load Setup
                  </Button>
                  
                  <Button 
                    fullWidth
                    size="small" 
                    variant="contained"
                    onClick={() => handleLoadAndAnalyze(setup)}
                    startIcon={<Analytics />}
                  >
                    Load & Analyze
                  </Button>

                  {setup.analysis_result && (
                    <Button 
                      fullWidth
                      size="small" 
                      variant="outlined"
                      color="success"
                      onClick={() => handleLoadWithAnalysis(setup)}
                      startIcon={<Analytics />}
                    >
                      Load with Analysis
                    </Button>
                  )}
                </CardActions>
              </Card>
          ))}
        </Box>
      )}
    </Box>
  );
}