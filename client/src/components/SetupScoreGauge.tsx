import { Box, Typography } from '@mui/material';
import { ResponsivePie } from '@nivo/pie';

interface SetupScoreGaugeProps {
  score: number;
}

export const SetupScoreGauge = ({ score }: SetupScoreGaugeProps) => {
  // Ensure score is between 0 and 100
  const clampedScore = Math.max(0, Math.min(100, score));
  
  // Create data for the pie chart to simulate a gauge
  const data = [
    {
      id: 'score',
      label: 'Score',
      value: clampedScore,
      color: getScoreColor(clampedScore)
    },
    {
      id: 'remaining',
      label: 'Remaining',
      value: 100 - clampedScore,
      color: '#f0f0f0'
    }
  ];

  return (
    <Box sx={{ position: 'relative', width: 300, height: 200 }}>
      {/* Nivo Pie Chart as Gauge */}
      <ResponsivePie
        data={data}
        margin={{ top: 20, right: 20, bottom: 20, left: 20 }}
        startAngle={-90}
        endAngle={90}
        innerRadius={0.6}
        padAngle={2}
        cornerRadius={3}
        activeOuterRadiusOffset={8}
        colors={({ data }) => data.color}
        borderWidth={0}
        enableArcLinkLabels={false}
        enableArcLabels={false}
        isInteractive={false}
        animate={true}
        motionConfig="wobbly"
      />
      
      {/* Score Text Overlay */}
      <Box
        sx={{
          position: 'absolute',
          top: '50%',
          left: '50%',
          transform: 'translate(-50%, -20%)',
          textAlign: 'center',
          zIndex: 10
        }}
      >
        <Typography 
          variant="h3" 
          sx={{ 
            fontWeight: 'bold',
            color: getScoreColor(clampedScore),
            lineHeight: 1
          }}
        >
          {clampedScore}
        </Typography>
        <Typography 
          variant="body2" 
          sx={{ 
            color: 'text.secondary',
            fontWeight: 500,
            mt: -0.5
          }}
        >
          Setup Score
        </Typography>
        <Typography 
          variant="caption" 
          sx={{ 
            color: 'text.secondary',
            display: 'block',
            mt: 0.5
          }}
        >
          {getScoreLabel(clampedScore)}
        </Typography>
      </Box>
    </Box>
  );
};

// Helper function to get color based on score
function getScoreColor(score: number): string {
  if (score >= 80) return '#4caf50'; // Green - Excellent
  if (score >= 70) return '#8bc34a'; // Light Green - Good
  if (score >= 60) return '#ffeb3b'; // Yellow - Decent
  if (score >= 50) return '#ff9800'; // Orange - Basic
  return '#f44336'; // Red - Poor
}

// Helper function to get label based on score
function getScoreLabel(score: number): string {
  if (score >= 90) return 'Excellent';
  if (score >= 80) return 'Very Good';
  if (score >= 70) return 'Good';
  if (score >= 60) return 'Decent';
  if (score >= 50) return 'Basic';
  return 'Needs Work';
}