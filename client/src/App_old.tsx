import { ThemeProvider, CssBaseline } from '@mui/material';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { Layout } from './components/Layout';
import { LandingPage } from './components/LandingPage';
import { SetupBuilderPage } from './components/SetupBuilderPage';
import { ImageAnalysisPage } from './components/ImageAnalysisPage';
import { Navigation } from './components/Navigation';
import { AuthProvider, useAuth } from './contexts/AuthContext';
import { ThemeModeProvider, useThemeMode } from './contexts/ThemeContext';
import { createReefTheme } from './theme';
import './styles/reef-theme.css';

function AppContent() {
  const { user } = useAuth();
  
  // RTK Query hook for the analyze mutation
  const [analyzeTank, { 
    data: analysisResult, 
    isLoading, 
    error: apiError,
    reset 
  }] = useAnalyzeTankMutation();

  // Use loaded analysis if available, otherwise use RTK Query result
  const currentAnalysis = loadedAnalysis || analysisResult;

  const handleSaveSetup = async (setup: TankSetup) => {
    if (!user) {
      setAuthDialogOpen(true);
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
    
    // Close the saved setups dialog
    setSavedSetupsOpen(false);
  };

  // Show landing page for unauthenticated users
  if (!user) {
    return <LandingPage />;
  }

  return (
    <>
      <Layout>
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

                {/* Navigation Buttons */}
                <Box sx={{ px: 3, pb: 2 }}>
                  <Box sx={{ display: 'flex', gap: 1, flexWrap: 'wrap' }}>
                    <Button
                      variant={currentView === 'main' ? 'contained' : 'outlined'}
                      onClick={() => setCurrentView('main')}
                      startIcon={<Settings />}
                      size="small"
                    >
                      Setup Builder
                    </Button>
                    <Button
                      variant={currentView === 'image-analysis' ? 'contained' : 'outlined'}
                      onClick={() => setCurrentView('image-analysis')}
                      startIcon={<AutoFixHigh />}
                      size="small"
                    >
                      Image Analysis
                    </Button>
                  </Box>
                </Box>

                {/* Main Content Area */}
                {currentView === 'main' && (
                  <>
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
                      icon={<FolderSpecial />} 
                      label="My Setups" 
                      iconPosition="start"
                    />
                  </Tabs>
                </Box>

                <Box sx={{ p: 3 }}>
                  {tabValue === 0 ? (
                    // Structured Form Tab (primary)
                    <Box sx={{ mb: 3 }}>
                      <TankSetupForm 
                        onSetupChange={setTankSetup} 
                        initialSetup={tankSetup}
                        onSaveSetup={handleSaveSetup}
                      />
                    </Box>
                  ) : tabValue === 1 ? (
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
                  ) : null}

                  {success && (
                    <Alert severity="success" sx={{ mb: 2 }} onClose={() => setSuccess('')}>
                      {success}
                    </Alert>
                  )}

                  {(error || apiError) && (
                    <Alert severity="error" sx={{ mb: 2 }}>
                      {error || 'An error occurred while analyzing your tank.'}
                    </Alert>
                  )}

                  {tabValue !== 2 && (
                    <Button
                      fullWidth
                      variant="contained"
                      size="large"
                      onClick={handleAnalyze}
                      disabled={
                        isLoading || 
                        (tabValue === 0 && (!tankSetup || (tankSetup.fish.length === 0 && tankSetup.corals.length === 0))) ||
                        (tabValue === 1 && !text.trim())
                      }
                    startIcon={isLoading ? <CircularProgress size={20} /> : <AutoFixHigh />}
                    sx={{ 
                      py: 1.5,
                      borderRadius: 3,
                      fontSize: '1.1rem',
                      background: `linear-gradient(135deg, ${theme.palette.primary.main}, ${theme.palette.secondary.main})`,
                      '&:hover': {
                        background: `linear-gradient(135deg, ${theme.palette.primary.dark}, ${theme.palette.secondary.dark})`,
                      },
                      '&:disabled': {
                        background: theme.palette.action.disabledBackground,
                      },
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
                  </>
                )}

                {/* Image Analysis View */}
                {currentView === 'image-analysis' && (
                  <Box sx={{ p: 3 }}>
                    <ImageAnalysisPage />
                  </Box>
                )}
              </CardContent>
            </Card>
          </Box>

          {/* Results Section */}
          <Box sx={{ flex: 1 }}>
            {isLoading ? (
              // Loading Animation
              <Paper 
                sx={{ 
                  p: 6,
                  borderRadius: 3,
                  border: `1px solid ${alpha(theme.palette.divider, 0.1)}`,
                  background: theme.palette.background.paper,
                  boxShadow: `0 8px 32px ${alpha(theme.palette.primary.main, 0.08)}`,
                  textAlign: 'center',
                  minHeight: 400,
                  display: 'flex',
                  flexDirection: 'column',
                  justifyContent: 'center',
                  alignItems: 'center'
                }}
              >
                <Box sx={{ mb: 4 }}>
                  {/* Animated Icons */}
                  <Box sx={{ 
                    display: 'flex', 
                    gap: 2, 
                    justifyContent: 'center',
                    mb: 3
                  }}>
                    <Box sx={{
                      animation: `${keyframes`
                        0% { transform: translateY(0px) rotate(0deg); opacity: 0.7; }
                        50% { transform: translateY(-10px) rotate(180deg); opacity: 1; }
                        100% { transform: translateY(0px) rotate(360deg); opacity: 0.7; }
                      `} 2s ease-in-out infinite`,
                      animationDelay: '0s'
                    }}>
                      <Science sx={{ fontSize: 40, color: 'primary.main' }} />
                    </Box>
                    <Box sx={{
                      animation: `${keyframes`
                        0% { transform: translateY(0px) rotate(0deg); opacity: 0.7; }
                        50% { transform: translateY(-10px) rotate(180deg); opacity: 1; }
                        100% { transform: translateY(0px) rotate(360deg); opacity: 0.7; }
                      `} 2s ease-in-out infinite`,
                      animationDelay: '0.7s'
                    }}>
                      <Psychology sx={{ fontSize: 40, color: 'secondary.main' }} />
                    </Box>
                    <Box sx={{
                      animation: `${keyframes`
                        0% { transform: translateY(0px) rotate(0deg); opacity: 0.7; }
                        50% { transform: translateY(-10px) rotate(180deg); opacity: 1; }
                        100% { transform: translateY(0px) rotate(360deg); opacity: 0.7; }
                      `} 2s ease-in-out infinite`,
                      animationDelay: '1.4s'
                    }}>
                      <TrendingUp sx={{ fontSize: 40, color: 'success.main' }} />
                    </Box>
                  </Box>

                  {/* Pulsing Progress */}
                  <CircularProgress 
                    size={60}
                    thickness={4}
                    sx={{ 
                      mb: 3,
                      '& .MuiCircularProgress-circle': {
                        strokeLinecap: 'round',
                      }
                    }}
                  />
                </Box>

                <Typography 
                  variant="h5" 
                  component="h3" 
                  sx={{ 
                    mb: 2, 
                    fontWeight: 600,
                    background: `linear-gradient(135deg, ${theme.palette.primary.main}, ${theme.palette.secondary.main})`,
                    backgroundClip: 'text',
                    WebkitBackgroundClip: 'text',
                    WebkitTextFillColor: 'transparent',
                  }}
                >
                  Analyzing Your Reef Setup
                </Typography>

                <Typography 
                  variant="body1" 
                  color="text.secondary"
                  sx={{ 
                    mb: 3,
                    maxWidth: 400,
                    lineHeight: 1.6
                  }}
                >
                  Our AI is carefully evaluating your tank parameters, species compatibility, 
                  equipment setup, and water chemistry to provide you with detailed insights...
                </Typography>

                {/* Animated Progress Steps */}
                <Box sx={{ 
                  display: 'flex',
                  gap: 1,
                  justifyContent: 'center',
                  alignItems: 'center'
                }}>
                  {[0, 1, 2, 3, 4].map((index) => (
                    <Box
                      key={index}
                      sx={{
                        width: 8,
                        height: 8,
                        borderRadius: '50%',
                        backgroundColor: 'primary.main',
                        animation: `${keyframes`
                          0%, 80%, 100% { transform: scale(0.8); opacity: 0.5; }
                          40% { transform: scale(1.2); opacity: 1; }
                        `} 1.5s ease-in-out infinite`,
                        animationDelay: `${index * 0.3}s`
                      }}
                    />
                  ))}
                </Box>
              </Paper>
            ) : currentAnalysis?.score ? (
              <Box sx={{ display: 'flex', flexDirection: 'column', gap: 3 }}>
                {/* Tank Setup Assessment */}
                <Paper 
                  sx={{ 
                    p: 3,
                    borderRadius: 3,
                    border: `1px solid ${alpha(theme.palette.divider, 0.1)}`,
                    background: theme.palette.background.paper,
                    boxShadow: `0 8px 32px ${alpha(theme.palette.primary.main, 0.08)}`,
                  }}
                >
                  <Typography variant="h6" component="h3" sx={{ mb: 3, textAlign: 'center' }}>
                    Tank Setup Assessment
                  </Typography>
                  
                  <Box sx={{ 
                    display: 'flex', 
                    flexDirection: 'column',
                    gap: 3, 
                    alignItems: 'center'
                  }}>
                    {/* Gauge Section */}
                    <Box sx={{ 
                      display: 'flex', 
                      justifyContent: 'center'
                    }}>
                      <SetupScoreGauge score={currentAnalysis.score} />
                    </Box>
                    
                    {/* General Assessment Section */}
                    <Box sx={{ width: '100%' }}>
                      <Typography 
                        variant="h6" 
                        sx={{ 
                          mb: 2, 
                          color: 'primary.main',
                          fontWeight: 600,
                          textAlign: 'center'
                        }}
                      >
                        General Assessment
                      </Typography>
                      <Typography 
                        variant="body1" 
                        sx={{ 
                          lineHeight: 1.7,
                          color: 'text.primary',
                          textAlign: 'justify',
                          '& p': { mb: 2 },
                          '& p:last-child': { mb: 0 }
                        }}
                      >
                        {currentAnalysis.generalAssessment || 
                         currentAnalysis.summary || 
                         "No general assessment available. Please try running the analysis again."}
                      </Typography>
                    </Box>
                  </Box>
                </Paper>

                {/* Analysis Results */}
                <Paper 
                  sx={{ 
                    p: 3,
                    borderRadius: 3,
                    border: `1px solid ${alpha(theme.palette.divider, 0.1)}`,
                    background: theme.palette.background.paper,
                    boxShadow: `0 8px 32px ${alpha(theme.palette.primary.main, 0.08)}`,
                  }}
                >
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
              <Paper 
                sx={{ 
                  p: 3, 
                  minHeight: 400,
                  borderRadius: 3,
                  border: `1px solid ${alpha(theme.palette.divider, 0.1)}`,
                  background: theme.palette.background.paper,
                  boxShadow: `0 8px 32px ${alpha(theme.palette.primary.main, 0.08)}`,
                }}
              >
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

      {/* Save Setup Dialog */}
      <Dialog 
        open={saveDialogOpen} 
        onClose={cancelSaveSetup}
        maxWidth="sm"
        fullWidth
      >
        <DialogTitle>Save Tank Setup</DialogTitle>
        <DialogContent>
          <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
            Give your tank setup a memorable name to save it for future use.
          </Typography>
          <TextField
            autoFocus
            fullWidth
            label="Setup Name"
            placeholder="e.g., My 75g Reef Tank"
            value={setupName}
            onChange={(e) => setSetupName(e.target.value)}
            variant="outlined"
            sx={{ mt: 1 }}
            onKeyPress={(e) => {
              if (e.key === 'Enter' && setupName.trim()) {
                confirmSaveSetup();
              }
            }}
          />
        </DialogContent>
        <DialogActions>
          <Button onClick={cancelSaveSetup} color="inherit">
            Cancel
          </Button>
          <Button 
            onClick={confirmSaveSetup} 
            variant="contained"
            disabled={!setupName.trim()}
          >
            Save Setup
          </Button>
        </DialogActions>
      </Dialog>
      
      {/* Saved Setups Manager */}
      <SavedSetupsManager
        open={savedSetupsOpen}
        onClose={() => setSavedSetupsOpen(false)}
        onLoadSetup={(setup) => setTankSetup(setup)}
        onLoadAndAnalyze={handleLoadAndAnalyze}
        onLoadWithAnalysis={handleLoadWithAnalysis}
        currentSetup={tankSetup}
        currentAnalysis={currentAnalysis || null}
      />
    </>
  );
}

function AppWrapper() {
  const { mode } = useThemeMode();
  const theme = createReefTheme(mode);

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

function App() {
  return (
    <ThemeModeProvider>
      <AppWrapper />
    </ThemeModeProvider>
  );
}

export default App
