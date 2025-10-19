import { Box, Typography, Divider } from '@mui/material';

interface FormattedResponseProps {
  content: string;
}

export const FormattedResponse = ({ content }: FormattedResponseProps) => {
  // Split content into sections and format them
  const formatContent = (text: string) => {
    // Split by double line breaks to get sections
    const sections = text.split('\n\n').filter(section => section.trim());
    
    return sections.map((section, index) => {
      const lines = section.split('\n').filter(line => line.trim());
      
      return (
        <Box key={index} sx={{ mb: 3 }}>
          {lines.map((line, lineIndex) => {
            const trimmedLine = line.trim();
            
            // Check if it's a header (starts with capital letter and ends with colon, or is all caps)
            const isHeader = /^[A-Z][^:]*:$/.test(trimmedLine) || 
                           /^[A-Z\s]{3,}$/.test(trimmedLine) ||
                           trimmedLine.includes('Assessment') || 
                           trimmedLine.includes('Recommendations') ||
                           trimmedLine.includes('Parameters') ||
                           trimmedLine.includes('Notes') ||
                           trimmedLine.includes('Steps');
            
            // Check if it's a bullet point or numbered list
            const isBulletPoint = /^[-•*]\s/.test(trimmedLine) || /^\d+\.\s/.test(trimmedLine);
            
            if (isHeader) {
              return (
                <Box key={lineIndex}>
                  {lineIndex > 0 && <Divider sx={{ my: 2 }} />}
                  <Typography 
                    variant="h6" 
                    sx={{ 
                      fontWeight: 600, 
                      color: 'primary.main',
                      mb: 1,
                      mt: lineIndex > 0 ? 2 : 0
                    }}
                  >
                    {trimmedLine}
                  </Typography>
                </Box>
              );
            } else if (isBulletPoint) {
              return (
                <Typography 
                  key={lineIndex}
                  variant="body1" 
                  sx={{ 
                    lineHeight: 1.7,
                    ml: 2,
                    mb: 0.5,
                    '&::before': {
                      content: '""',
                      display: 'inline-block',
                      width: 6,
                      height: 6,
                      backgroundColor: 'secondary.main',
                      borderRadius: '50%',
                      mr: 1,
                      verticalAlign: 'middle'
                    }
                  }}
                >
                  {trimmedLine.replace(/^[-•*]\s/, '').replace(/^\d+\.\s/, '')}
                </Typography>
              );
            } else {
              return (
                <Typography 
                  key={lineIndex}
                  variant="body1" 
                  sx={{ 
                    lineHeight: 1.7,
                    mb: 1
                  }}
                >
                  {trimmedLine}
                </Typography>
              );
            }
          })}
        </Box>
      );
    });
  };

  return (
    <Box sx={{ maxWidth: '100%' }}>
      {formatContent(content)}
    </Box>
  );
};