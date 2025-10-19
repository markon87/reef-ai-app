import { Box, Typography, Card, CardContent } from '@mui/material';
import { Build, Opacity, Pets, Lightbulb } from '@mui/icons-material';
import type { AnalysisBreakdown } from '../store/api';

interface AnalysisBreakdownProps {
  breakdown: AnalysisBreakdown;
}

export const AnalysisBreakdownComponent = ({ breakdown }: AnalysisBreakdownProps) => {
  const sections = [
    {
      key: 'equipment',
      title: 'Equipment Assessment',
      icon: <Build />,
      content: breakdown.equipment,
      color: '#1976d2'
    },
    {
      key: 'waterParams',
      title: 'Water Parameters',
      icon: <Opacity />,
      content: breakdown.waterParams,
      color: '#2196f3'
    },
    {
      key: 'livestock',
      title: 'Livestock Compatibility',
      icon: <Pets />,
      content: breakdown.livestock,
      color: '#26a69a'
    },
    {
      key: 'recommendations',
      title: 'Recommendations',
      icon: <Lightbulb />,
      content: breakdown.recommendations,
      color: '#ff9800'
    }
  ];

  const availableSections = sections.filter(section => section.content);

  if (availableSections.length === 0) {
    return (
      <Typography variant="body1" color="text.secondary">
        No detailed breakdown available.
      </Typography>
    );
  }

  return (
    <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
      {availableSections.map((section) => (
        <Card 
          key={section.key} 
          elevation={1} 
          sx={{ 
            border: `1px solid ${section.color}20`,
            '&:hover': {
              boxShadow: 2
            }
          }}
        >
          <CardContent sx={{ py: 2 }}>
            <Box sx={{ display: 'flex', alignItems: 'center', mb: 1.5 }}>
              <Box sx={{ color: section.color, mr: 1 }}>
                {section.icon}
              </Box>
              <Typography 
                variant="subtitle1" 
                sx={{ 
                  fontWeight: 600,
                  color: section.color
                }}
              >
                {section.title}
              </Typography>
            </Box>
            <Typography 
              variant="body2" 
              sx={{ 
                lineHeight: 1.6,
                color: 'text.primary'
              }}
            >
              {section.content}
            </Typography>
          </CardContent>
        </Card>
      ))}
    </Box>
  );
};