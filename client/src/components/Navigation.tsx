import { Box, Button, useTheme } from '@mui/material';
import { Settings, AutoFixHigh } from '@mui/icons-material';
import { useLocation, useNavigate } from 'react-router-dom';

export const Navigation = () => {
  const theme = useTheme();
  const location = useLocation();
  const navigate = useNavigate();

  const navItems = [
    {
      path: '/',
      label: 'Setup Builder',
      icon: <Settings />,
    },
    {
      path: '/image-analysis',
      label: 'Image Analysis',
      icon: <AutoFixHigh />,
    },
  ];

  return (
    <Box sx={{ 
      display: 'flex', 
      gap: 1, 
      mb: 3,
      p: 2,
      backgroundColor: theme.palette.background.paper,
      borderRadius: 2,
      border: `1px solid ${theme.palette.divider}`,
    }}>
      {navItems.map((item) => (
        <Button
          key={item.path}
          variant={location.pathname === item.path ? 'contained' : 'outlined'}
          onClick={() => navigate(item.path)}
          startIcon={item.icon}
          sx={{
            minWidth: 140,
          }}
        >
          {item.label}
        </Button>
      ))}
    </Box>
  );
};