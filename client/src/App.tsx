import { useState } from 'react';
import { ThemeProvider, CssBaseline, GlobalStyles } from '@mui/material';
import { 
  Card, 
  CardContent, 
  TextField, 
  Button, 
  Typography, 
  Box, 
  Alert,
  CircularProgress,
  Paper,
  Tabs,
  Tab
} from '@mui/material';
import { AutoFixHigh, Biotech, Description, Settings } from '@mui/icons-material';
import { Layout } from './components/Layout';
import { FormattedResponse } from './components/FormattedResponse';
import { SetupScoreGauge } from './components/SetupScoreGauge';
import { AnalysisBreakdownComponent } from './components/AnalysisBreakdown';
import { TankSetupForm, type TankSetup } from './components/TankSetupForm';
import { SignInPrompt } from './components/SignInPrompt';
import { AuthDialog } from './components/AuthDialog';
import { SavedSetupsManager } from './components/SavedSetupsManager';
import { type AnalysisResult } from './services/tankSetupService';
import { AuthProvider, useAuth } from './contexts/AuthContext';
import { theme } from './theme';
import { useAnalyzeTankMutation } from './store/api';

function AppContent() {
  const { user } = useAuth();
  const [authDialogOpen, setAuthDialogOpen] = useState(false);
  const [savedSetupsOpen, setSavedSetupsOpen] = useState(false);
  const [text, setText] = useState("");
  const [error, setError] = useState("");
  const [tabValue, setTabValue] = useState(0); // 0 = Setup Form (primary), 1 = Description
  const [tankSetup, setTankSetup] = useState<TankSetup | null>(null);
  const [loadedAnalysis, setLoadedAnalysis] = useState<AnalysisResult | null>(null);
  
  // RTK Query hook for the analyze mutation
  const [analyzeTank, { 
    data: analysisResult, 
    isLoading, 
    error: apiError,
    reset 
  }] = useAnalyzeTankMutation();

  // Use loaded analysis if available, otherwise use RTK Query result
  const currentAnalysis = loadedAnalysis || analysisResult;

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
    
    // Close the saved setups dialog
    setSavedSetupsOpen(false);
  };

  return (
    <>
      <Layout>
        <Box sx={{ display: 'flex', gap: 4, flexDirection: { xs: 'column', md: 'row' } }}>
          {/* Input Section */}
          <Box sx={{ flex: 1 }}>
            <Card elevation={3}>
              <CardContent sx={{ p: 0 }}>
                <Box sx={{ display: 'flex', alignItems: 'center', p: 3, pb: 1 }}>
                  <Biotech sx={{ mr: 1, color: 'primary.main' }} />
                  <Typography variant="h5" component="h2">
                    Reef Tank Builder & Analysis
                  </Typography>
                </Box>

                {/* Tabs and Actions */}
                <Box sx={{ display: 'flex', alignItems: 'center', borderBottom: 1, borderColor: 'divider' }}>
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
                  </Tabs>
                  
                  {/* Save/Load Buttons */}
                  {user && (
                    <Box sx={{ px: 2 }}>
                      <Button
                        size="small"
                        variant="outlined"
                        onClick={() => setSavedSetupsOpen(true)}
                        sx={{ mr: 1 }}
                      >
                        My Setups
                      </Button>
                    </Box>
                  )}
                </Box>

                <Box sx={{ p: 3 }}>
                  {tabValue === 0 ? (
                    // Structured Form Tab (primary)
                    <Box sx={{ mb: 3 }}>
                      <TankSetupForm onSetupChange={setTankSetup} initialSetup={tankSetup} />
                    </Box>
                  ) : (
                    // Text Description Tab (alternative)
                    <TextField
                      fullWidth
                      multiline
                      rows={6}
                      variant="outlined"
                      label="Describe your aquarium setup"
                      placeholder="E.g., 75-gallon saltwater reef tank with LED lighting, protein skimmer, and live rock. Water parameters: pH 8.2, salinity 1.025, temperature 78°F..."
                      value={text}
                      onChange={(e) => setText(e.target.value)}
                      sx={{ mb: 3 }}
                    />
                  )}

                  {(error || apiError) && (
                    <Alert severity="error" sx={{ mb: 2 }}>
                      {error || 'An error occurred while analyzing your tank.'}
                    </Alert>
                  )}

                  <Button
                    fullWidth
                    variant="contained"
                    size="large"
                    onClick={user ? handleAnalyze : () => setAuthDialogOpen(true)}
                    disabled={
                      isLoading || 
                      (!user) ||
                      (tabValue === 0 && (!tankSetup || (tankSetup.fish.length === 0 && tankSetup.corals.length === 0))) ||
                      (tabValue === 1 && !text.trim())
                    }
                    startIcon={isLoading ? <CircularProgress size={20} /> : <AutoFixHigh />}
                    sx={{ py: 1.5 }}
                  >
                    {!user ? 'Sign In to Analyze' : isLoading ? 'Analyzing...' : 'Analyze Tank'}
                  </Button>
                </Box>
              </CardContent>
            </Card>
          </Box>

          {/* Results Section */}
          <Box sx={{ flex: 1 }}>
            {!user ? (
              <SignInPrompt onSignInClick={() => setAuthDialogOpen(true)} />
            ) : currentAnalysis?.score ? (
              <Box sx={{ display: 'flex', flexDirection: 'column', gap: 3 }}>
                {/* Score Gauge */}
                <Paper elevation={2} sx={{ p: 3 }}>
                  <Typography variant="h6" component="h3" sx={{ mb: 2, textAlign: 'center' }}>
                    Tank Setup Assessment
                  </Typography>
                  <SetupScoreGauge score={currentAnalysis.score} />
                </Paper>

                {/* Analysis Results */}
                <Paper elevation={2} sx={{ p: 3 }}>
                  <Typography variant="h6" component="h3" sx={{ mb: 3 }}>
                    Detailed Analysis
                  </Typography>
                  {currentAnalysis.breakdown && Object.keys(currentAnalysis.breakdown).length > 0 ? (
                    <AnalysisBreakdownComponent breakdown={currentAnalysis.breakdown} />
                  ) : (
                    <FormattedResponse content={currentAnalysis.summary || currentAnalysis.result || ""} />
                  )}
                </Paper>
              </Box>
            ) : (
              <Paper elevation={2} sx={{ p: 3, minHeight: 400 }}>
                <Typography variant="h5" component="h2" sx={{ mb: 2 }}>
                  AI Analysis Results
                </Typography>
                <Box 
                  sx={{ 
                    display: 'flex', 
                    alignItems: 'center', 
                    justifyContent: 'center',
                    minHeight: 300,
                    color: 'text.secondary'
                  }}
                >
                  <Typography variant="body1" align="center">
                    Build your reef tank setup using the form and get AI-powered analysis and recommendations.<br/>
                    <strong>Add fish or corals to get started!</strong>
                  </Typography>
                </Box>
              </Paper>
            )}
          </Box>
        </Box>
      </Layout>
      
      {/* Auth Dialog */}
      <AuthDialog 
        open={authDialogOpen} 
        onClose={() => setAuthDialogOpen(false)} 
      />
      
      {/* Saved Setups Manager */}
      {user && (
        <SavedSetupsManager
          open={savedSetupsOpen}
          onClose={() => setSavedSetupsOpen(false)}
          onLoadSetup={(setup) => setTankSetup(setup)}
          onLoadAndAnalyze={handleLoadAndAnalyze}
          onLoadWithAnalysis={handleLoadWithAnalysis}
          currentSetup={tankSetup}
          currentAnalysis={currentAnalysis || null}
        />
      )}
    </>
  );
}

function App() {
  return (
    <ThemeProvider theme={theme}>
      <CssBaseline />
      <GlobalStyles
        styles={{
          html: {
            margin: 0,
            padding: 0,
            width: '100%',
            overflowX: 'hidden'
          },
          body: {
            margin: 0,
            padding: 0,
            width: '100%',
            overflowX: 'hidden'
          },
          '#root': {
            margin: 0,
            padding: 0,
            width: '100%',
            overflowX: 'hidden'
          },
          '.MuiContainer-root': {
            maxWidth: 'none !important',
            width: '100% !important'
          },
          '.MuiToolbar-root': {
            maxWidth: 'none !important'
          }
        }}
      />
      <AuthProvider>
        <AppContent />
      </AuthProvider>
    </ThemeProvider>
  );
}

export default App
