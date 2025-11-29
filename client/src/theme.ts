import { createTheme } from '@mui/material/styles';
import type { PaletteMode } from '@mui/material';

// ReefAI Base Colors
const reefColors = {
  blue: '#003C71',      // Deep ocean blue
  aqua: '#00AEEF',      // Vibrant aqua
  lightBlue: '#66D3FA', // Soft water highlight
  darkBlue: '#001F3F',  // Dark deep-sea tone
  coral: '#00C2A8',     // Optional accent tone (techy sea-green)
  white: '#F9FAFB',     // Clean white
};

// Light theme configuration
const lightThemeColors = {
  bg: '#F9FAFB',          // Light background
  surface: '#E6F6FB',     // Slightly aqua-tinted surface
  text: '#002B5B',        // Deep text for readability
  primary: '#00AEEF',     // Main brand aqua
  primaryHover: '#00C2A8',
  accent: '#003C71',      // Dark blue accent
  border: '#B8E1F9',      // Subtle light border
  cardBg: '#FFFFFF',
  shadow: 'rgba(0, 60, 113, 0.1)',
};

// Dark theme configuration
const darkThemeColors = {
  bg: '#001F3F',          // Deep navy background
  surface: '#002B5B',     // Slightly lighter surface
  text: '#E6F6FB',        // Soft aqua text
  primary: '#00AEEF',     // Brand aqua
  primaryHover: '#66D3FA',
  accent: '#00C2A8',      // Sea-green accent
  border: '#004C80',      // Dim blue border
  cardBg: '#003C71',
  shadow: 'rgba(0, 174, 239, 0.15)',
};

// Create theme function that accepts mode
export const createReefTheme = (mode: PaletteMode = 'light') => {
  const colors = mode === 'light' ? lightThemeColors : darkThemeColors;
  
  return createTheme({
    palette: {
      mode,
      primary: {
        main: colors.primary,
        light: mode === 'light' ? reefColors.lightBlue : reefColors.lightBlue,
        dark: mode === 'light' ? reefColors.blue : reefColors.darkBlue,
        contrastText: mode === 'light' ? reefColors.white : reefColors.white,
      },
      secondary: {
        main: colors.accent,
        light: mode === 'light' ? reefColors.coral : reefColors.coral,
        dark: mode === 'light' ? reefColors.darkBlue : reefColors.blue,
        contrastText: reefColors.white,
      },
      background: {
        default: colors.bg,
        paper: colors.cardBg,
      },
      text: {
        primary: colors.text,
        secondary: mode === 'light' ? 'rgba(0, 43, 91, 0.7)' : 'rgba(230, 246, 251, 0.7)',
      },
      divider: colors.border,
      action: {
        hover: mode === 'light' ? 'rgba(0, 174, 239, 0.04)' : 'rgba(0, 174, 239, 0.08)',
        selected: mode === 'light' ? 'rgba(0, 174, 239, 0.08)' : 'rgba(0, 174, 239, 0.12)',
      },
    },
    breakpoints: {
      values: {
        xs: 0,
        sm: 600,
        md: 900,
        lg: 1200,
        xl: 1536,
      },
    },
    typography: {
      fontFamily: '"Inter", "Roboto", "Helvetica", "Arial", sans-serif',
      h1: {
        fontSize: '2.5rem',
        fontWeight: 700,
        color: colors.text,
      },
      h2: {
        fontSize: '2rem',
        fontWeight: 600,
        color: colors.text,
      },
      h3: {
        fontSize: '1.75rem',
        fontWeight: 600,
        color: colors.text,
      },
      h4: {
        fontSize: '1.5rem',
        fontWeight: 600,
        color: colors.text,
      },
      h5: {
        fontSize: '1.25rem',
        fontWeight: 600,
        color: colors.text,
      },
      h6: {
        fontSize: '1.125rem',
        fontWeight: 600,
        color: colors.text,
      },
      body1: {
        color: colors.text,
      },
      body2: {
        color: colors.text,
      },
    },
    components: {
      MuiButton: {
        styleOverrides: {
          root: {
            borderRadius: 12,
            textTransform: 'none',
            fontWeight: 600,
            boxShadow: 'none',
            '&:hover': {
              boxShadow: `0 4px 12px ${colors.shadow}`,
            },
          },
          contained: {
            background: `linear-gradient(135deg, ${colors.primary}, ${colors.primaryHover})`,
            color: reefColors.white,
            '&:hover': {
              background: `linear-gradient(135deg, ${colors.primaryHover}, ${colors.accent})`,
            },
          },
        },
      },
      MuiCard: {
        styleOverrides: {
          root: {
            borderRadius: 16,
            border: `1px solid ${colors.border}`,
            background: colors.cardBg,
            boxShadow: `0 8px 32px ${colors.shadow}`,
            backdropFilter: 'blur(10px)',
          },
        },
      },
      MuiPaper: {
        styleOverrides: {
          root: {
            borderRadius: 16,
            border: `1px solid ${colors.border}`,
            background: colors.cardBg,
            boxShadow: `0 8px 32px ${colors.shadow}`,
          },
        },
      },
      MuiContainer: {
        styleOverrides: {
          root: {
            maxWidth: 'none !important',
            width: '100%',
          },
        },
      },
      MuiToolbar: {
        styleOverrides: {
          root: {
            '@media (min-width: 0px)': {
              maxWidth: 'none',
            },
          },
        },
      },
      MuiTextField: {
        styleOverrides: {
          root: {
            '& .MuiOutlinedInput-root': {
              borderRadius: 12,
              '& fieldset': {
                borderColor: colors.border,
              },
              '&:hover fieldset': {
                borderColor: colors.primary,
              },
              '&.Mui-focused fieldset': {
                borderColor: colors.primary,
              },
            },
          },
        },
      },
    },
  });
};

// Default light theme export for backward compatibility
export const theme = createReefTheme('light');

// Export both themes
export const lightTheme = createReefTheme('light');
export const darkTheme = createReefTheme('dark');

// Export colors for use in components
export { reefColors, lightThemeColors, darkThemeColors };