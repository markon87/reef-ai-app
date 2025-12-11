import { useState } from 'react';
import {
  Card, 
  CardContent, 
  TextField, 
  Button, 
  Typography, 
  Box, 
  Alert,
  CircularProgress,
  Tabs,
  Tab,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  useTheme
} from '@mui/material';
import { Biotech, Description, Settings, Psychology } from '@mui/icons-material';
import { FormattedResponse } from './FormattedResponse';
import { SetupScoreGauge } from './SetupScoreGauge';
import { AnalysisBreakdownComponent } from './AnalysisBreakdown';
import { TankSetupForm, type TankSetup } from './TankSetupForm';
import { MySetupsPage } from './MySetupsPage';
import { type AnalysisResult, TankSetupService } from '../services/tankSetupService';
import { useAuth } from '../contexts/AuthContext';
import { useAnalyzeTankMutation } from '../store/api';

export const SetupBuilderPage = () => {
  const theme = useTheme();
  const { user } = useAuth();
  const [saveDialogOpen, setSaveDialogOpen] = useState(false);
  const [setupName, setSetupName] = useState("");
  const [setupToSave, setSetupToSave] = useState<TankSetup | null>(null);
  const [text, setText] = useState("");
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");
  const [tabValue, setTabValue] = useState(0); // 0 = Setup Form (primary), 1 = Description, 2 = My Setups
  const [tankSetup, setTankSetup] = useState<TankSetup | null>(null);
  const [loadedAnalysis, setLoadedAnalysis] = useState<AnalysisResult | null>(null);
  
  // RTK Query hook for the analyze mutation
  const [analyzeTank, { 
    data: analysisResult, 
    isLoading, 
    error: _apiError,
    reset 
  }] = useAnalyzeTankMutation();

  // Use loaded analysis if available, otherwise use RTK Query result
  const currentAnalysis = loadedAnalysis || analysisResult;

  const handleSaveSetup = async (setup: TankSetup) => {
    if (!user) {
      setError('Please sign in to save tank setups');
      return;
    }

    setSetupToSave(setup);
    setSaveDialogOpen(true);
    setSetupName('');
  };

  const confirmSaveSetup = async () => {
    if (!setupToSave || !setupName.trim()) return;

    try {
      const result = await TankSetupService.saveTankSetup(setupToSave, setupName.trim(), currentAnalysis || undefined);
      if (result.error) {
        setError(result.error);
      } else {
        setError('');
        setSaveDialogOpen(false);
        setSetupName('');
        setSetupToSave(null);
        setSuccess('Tank setup saved successfully!');
        setTimeout(() => setSuccess(''), 3000);
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to save setup');
    }
  };

  const cancelSaveSetup = () => {
    setSaveDialogOpen(false);
    setSetupName('');
    setSetupToSave(null);
  };

  const convertSetupToDescription = (setup: TankSetup): string => {
    let description = `${setup.volume}-gallon saltwater reef tank with ${setup.lighting} lighting`;
    
    if (setup.filtration.length > 0) {
      description += `, ${setup.filtration.join(' and ')} filtration`;
    }
    
    const equipment = [];
    if (setup.hasProteinSkimmer) equipment.push('protein skimmer');
    if (setup.hasHeater) equipment.push('heater');
    if (setup.hasWavemaker) equipment.push('wavemaker');
    
    if (equipment.length > 0) {
      description += `, equipped with ${equipment.join(', ')}`;
    }
    
    if (setup.fish.length > 0) {
      const fishList = setup.fish.map(f => `${f.quantity}x ${f.species}`).join(', ');
      description += `. Fish: ${fishList}`;
    }
    
    if (setup.corals.length > 0) {
      const coralList = setup.corals.map(c => `${c.quantity}x ${c.species}`).join(', ');
      description += `. Corals: ${coralList}`;
    }
    
    const waterParams = [];
    if (setup.waterParams.ph) waterParams.push(`pH ${setup.waterParams.ph}`);
    if (setup.waterParams.salinity) waterParams.push(`salinity ${setup.waterParams.salinity}`);
    if (setup.waterParams.temperature) waterParams.push(`temperature ${setup.waterParams.temperature}°F`);
    
    if (waterParams.length > 0) {
      description += `. Water parameters: ${waterParams.join(', ')}`;
    }
    
    return description;
  };

  const handleAnalyze = async () => {
    let description = '';
    
    if (tabValue === 0) {
      // Structured form tab (primary)
      if (!tankSetup || (tankSetup.fish.length === 0 && tankSetup.corals.length === 0)) {
        setError("Please configure your tank setup with at least one fish or coral.");
        return;
      }
      description = convertSetupToDescription(tankSetup);
    } else {
      // Text description tab (alternative)
      if (!text.trim()) {
        setError("Please enter a tank description first.");
        return;
      }
      description = text;
    }

    setError("");
    reset(); // Clear previous results
    setLoadedAnalysis(null); // Clear loaded analysis
    
    try {
      await analyzeTank({ tankDescription: description }).unwrap();
    } catch (err) {
      console.error('Analysis failed:', err);
      setError('Failed to analyze tank. Please check if the server is running and try again.');
    }
  };

  const handleTabChange = (_event: React.SyntheticEvent, newValue: number) => {
    setTabValue(newValue);
    setError(""); // Clear errors when switching tabs
  };

  const handleLoadAndAnalyze = async (setup: TankSetup) => {
    // Load the setup into the form
    setTankSetup(setup);
    
    // Clear any previous errors
    setError("");
    reset(); // Clear previous results
    setLoadedAnalysis(null); // Clear loaded analysis
    
    // Convert setup to description and analyze
    const description = convertSetupToDescription(setup);
    
    try {
      await analyzeTank({ tankDescription: description }).unwrap();
    } catch (err) {
      console.error('Analysis failed:', err);
      setError('Failed to analyze the loaded tank setup.');
      throw err; // Re-throw so the SavedSetupsManager can handle it
    }
  };

  const handleLoadWithAnalysis = (setup: TankSetup, analysis: AnalysisResult) => {
    // Load the setup into the form
    setTankSetup(setup);
    
    // Clear any previous errors and RTK Query state
    setError("");
    reset(); // Clear RTK Query state
    
    // Set the loaded analysis results
    setLoadedAnalysis(analysis);
  };

  return (
    <>
      {/* Alerts */}
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

      <Box sx={{ display: 'flex', gap: 4, flexDirection: { xs: 'column', md: 'row' } }}>
        {/* Input Section */}
        <Box sx={{ flex: 1 }}>
          <Card 
            sx={{
              borderRadius: 3,
              border: `1px solid ${theme.palette.divider}`,
              background: theme.palette.background.paper,
              boxShadow: `0 8px 32px ${theme.palette.action.hover}`,
            }}
          >
            <CardContent sx={{ p: 0 }}>
              <Box sx={{ display: 'flex', alignItems: 'center', p: 3, pb: 1 }}>
                <Biotech sx={{ mr: 1, color: 'primary.main' }} />
                <Typography variant="h5" component="h2">
                  Reef Tank Builder & Analysis
                </Typography>
              </Box>

              {/* Tabs and Actions */}
              <Box sx={{ borderBottom: 1, borderColor: 'divider' }}>
                <Tabs 
                  value={tabValue} 
                  onChange={handleTabChange} 
                  sx={{ flex: 1 }}
                >
                  <Tab 
                    icon={<Settings />} 
                    label="Setup Form" 
                    iconPosition="start"
                  />
                  <Tab 
                    icon={<Description />} 
                    label="Description" 
                    iconPosition="start"
                  />
                  <Tab 
                    icon={<Psychology />} 
                    label="My Setups" 
                    iconPosition="start"
                  />
                </Tabs>
              </Box>

              {/* Tab Content */}
              <Box sx={{ p: 3 }}>
                {/* Setup Form Tab */}
                {tabValue === 0 && (
                  <TankSetupForm
                    onSetupChange={setTankSetup}
                    initialSetup={tankSetup}
                    onSaveSetup={handleSaveSetup}
                  />
                )}

                {/* Description Tab */}
                {tabValue === 1 && (
                  <TextField
                    fullWidth
                    multiline
                    rows={12}
                    value={text}
                    onChange={(e) => setText(e.target.value)}
                    placeholder="Describe your reef tank setup in detail..."
                    variant="outlined"
                    sx={{ mb: 3 }}
                  />
                )}

                {/* Analyze Button */}
                {(tabValue === 0 || tabValue === 1) && (
                  <Button
                    variant="contained"
                    size="large"
                    onClick={handleAnalyze}
                    disabled={isLoading || (tabValue === 0 && (!tankSetup || (tankSetup.fish.length === 0 && tankSetup.corals.length === 0))) || (tabValue === 1 && !text.trim())}
                    startIcon={isLoading ? <CircularProgress size={20} /> : <Psychology />}
                    fullWidth
                    sx={{
                      py: 1.5,
                      fontSize: '1.1rem',
                      fontWeight: 600,
                    }}
                  >
                    {isLoading ? 'Analyzing...' : 'Analyze Tank'}
                  </Button>
                )}

                {/* My Setups Page Content */}
                {tabValue === 2 && (
                  <MySetupsPage
                    onLoadSetup={setTankSetup}
                    onLoadAndAnalyze={handleLoadAndAnalyze}
                    onLoadWithAnalysis={handleLoadWithAnalysis}
                    onNavigateToSetup={() => setTabValue(0)}
                  />
                )}
              </Box>
            </CardContent>
          </Card>
        </Box>

        {/* Results Section */}
        <Box sx={{ flex: 1 }}>
          <Card 
            sx={{
              borderRadius: 3,
              border: `1px solid ${theme.palette.divider}`,
              background: theme.palette.background.paper,
              boxShadow: `0 8px 32px ${theme.palette.action.hover}`,
              minHeight: 400,
            }}
          >
            <CardContent>
              <Typography variant="h5" gutterBottom sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                <Psychology color="primary" />
                Tank Analysis Results
              </Typography>

              {currentAnalysis ? (
                <>
                  {/* Score Gauge */}
                  <Box sx={{ mb: 3 }}>
                    <SetupScoreGauge score={currentAnalysis.score} />
                  </Box>

                  {/* Analysis Breakdown */}
                  {currentAnalysis.breakdown && <AnalysisBreakdownComponent breakdown={currentAnalysis.breakdown} />}

                  {/* Formatted Response */}
                  <Box sx={{ mt: 3 }}>
                    <FormattedResponse content={currentAnalysis.summary || currentAnalysis.result || ""} />
                  </Box>
                </>
              ) : (
                <Box sx={{ 
                  display: 'flex', 
                  flexDirection: 'column', 
                  alignItems: 'center', 
                  justifyContent: 'center',
                  minHeight: 300,
                  color: 'text.secondary'
                }}>
                  <Psychology sx={{ fontSize: 64, mb: 2, opacity: 0.3 }} />
                  <Typography variant="h6" gutterBottom>
                    No Analysis Yet
                  </Typography>
                  <Typography variant="body2" textAlign="center">
                    Configure your tank setup and click "Analyze Tank" to see AI-powered recommendations
                  </Typography>
                </Box>
              )}
            </CardContent>
          </Card>
        </Box>
      </Box>

      {/* Save Setup Dialog */}
      <Dialog open={saveDialogOpen} onClose={cancelSaveSetup} maxWidth="sm" fullWidth>
        <DialogTitle>Save Tank Setup</DialogTitle>
        <DialogContent>
          <TextField
            autoFocus
            fullWidth
            label="Setup Name"
            value={setupName}
            onChange={(e) => setSetupName(e.target.value)}
            placeholder="e.g., My 75g Mixed Reef"
            sx={{ mt: 2 }}
          />
        </DialogContent>
        <DialogActions>
          <Button onClick={cancelSaveSetup}>Cancel</Button>
          <Button 
            onClick={confirmSaveSetup} 
            variant="contained"
            disabled={!setupName.trim()}
          >
            Save Setup
          </Button>
        </DialogActions>
      </Dialog>
    </>
  );
};