import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Box, Typography, Button, Paper } from '@mui/material';
import { ArrowBack, Build } from '@mui/icons-material';
import { MySetupsPage } from './MySetupsPage';
import { type TankSetup } from './TankSetupForm';
import { type AnalysisResult } from '../services/tankSetupService';

export function MySetupsPageWrapper() {
  const navigate = useNavigate();

  const handleLoadSetup = (setup: TankSetup) => {
    // Navigate to main page with setup data
    // We'll need to implement a way to pass this data
    navigate('/', { state: { loadSetup: setup } });
  };

  const handleLoadAndAnalyze = async (setup: TankSetup) => {
    // Navigate to main page and trigger analysis
    navigate('/', { state: { loadSetup: setup, analyze: true } });
  };

  const handleLoadWithAnalysis = (setup: TankSetup, analysis: AnalysisResult) => {
    // Navigate to main page with setup and analysis
    navigate('/', { state: { loadSetup: setup, analysis: analysis } });
  };

  const handleNavigateToSetup = () => {
    navigate('/');
  };

  return (
    <Box sx={{ p: 3 }}>
      {/* Header */}
      <Box sx={{ display: 'flex', alignItems: 'center', gap: 2, mb: 3 }}>
        <Button
          startIcon={<ArrowBack />}
          onClick={() => navigate(-1)}
          variant="outlined"
          size="small"
        >
          Back
        </Button>
        <Typography variant="h4" sx={{ display: 'flex', alignItems: 'center', gap: 1, flex: 1 }}>
          <Build color="primary" />
          My Tank Setups
        </Typography>
        <Button
          startIcon={<Build />}
          onClick={handleNavigateToSetup}
          variant="contained"
        >
          Create New Setup
        </Button>
      </Box>

      {/* Description */}
      <Paper sx={{ p: 3, mb: 3, bgcolor: 'background.default' }}>
        <Typography variant="body1" color="text.secondary">
          Manage all your saved tank configurations. Load existing setups to modify them, 
          run fresh analysis, or view previous analysis results.
        </Typography>
      </Paper>

      {/* MySetupsPage Content */}
      <MySetupsPage
        onLoadSetup={handleLoadSetup}
        onLoadAndAnalyze={handleLoadAndAnalyze}
        onLoadWithAnalysis={handleLoadWithAnalysis}
        onNavigateToSetup={handleNavigateToSetup}
      />
    </Box>
  );
}