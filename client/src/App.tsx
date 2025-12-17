import { ThemeProvider, CssBaseline } from '@mui/material';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { Layout } from './components/Layout';
import { LandingPage } from './components/LandingPage';
import { SetupBuilderPage } from './components/SetupBuilderPage';
import { ImageAnalysisPage } from './components/ImageAnalysisPage';
import { ProfilePage } from './components/ProfilePage';
import { Navigation } from './components/Navigation';
import { AuthProvider, useAuth } from './contexts/AuthContext';
import { ThemeModeProvider, useThemeMode } from './contexts/ThemeContext';
import { createReefTheme } from './theme';
import './styles/reef-theme.css';

function AppContent() {
  const { user } = useAuth();

  // Show landing page for unauthenticated users
  if (!user) {
    return <LandingPage />;
  }

  return (
    <Layout>
      <Navigation />
      <Routes>
        <Route path="/" element={<SetupBuilderPage />} />
        <Route path="/image-analysis" element={<ImageAnalysisPage />} />
        <Route path="/profile" element={<ProfilePage />} />
        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </Layout>
  );
}

function AppWrapper() {
  const { mode } = useThemeMode();
  const theme = createReefTheme(mode);

  return (
    <ThemeProvider theme={theme}>
      <CssBaseline />
      <BrowserRouter>
        <AppContent />
      </BrowserRouter>
    </ThemeProvider>
  );
}

function App() {
  return (
    <AuthProvider>
      <ThemeModeProvider>
        <AppWrapper />
      </ThemeModeProvider>
    </AuthProvider>
  );
}

export default App;