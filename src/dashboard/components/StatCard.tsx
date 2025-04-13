import * as React from 'react';
import { useTheme } from '@mui/material/styles';
import Box from '@mui/material/Box';
import Card from '@mui/material/Card';
import CardContent from '@mui/material/CardContent';
import Chip from '@mui/material/Chip';
import Stack from '@mui/material/Stack';
import Typography from '@mui/material/Typography';
import { SparkLineChart } from '@mui/x-charts/SparkLineChart';
import { areaElementClasses } from '@mui/x-charts/LineChart';
import { useRouter } from 'next/navigation';

export type StatCardProps = {
  title: string;
  description: string;
  icon: JSX.Element;
  path: string;
};

export default function StatCard({
  title,
  description,
  icon,
  path,
}: StatCardProps) {
  const theme = useTheme();
  const router = useRouter();

  const handleClick = () => {
    router.push(path);
  };

  return (
    <Card 
  variant="outlined" 
  onClick={handleClick}
  sx={{ 
    height: '100%', 
    flexGrow: 1,
    cursor: 'pointer',
    display: 'flex',  // Added for centering
    flexDirection: 'column',  // Added for centering
  }}
>
  <CardContent sx={{ 
    display: 'flex', 
    flexDirection: 'column', 
    alignItems: 'center',  // Center content horizontally
    textAlign: 'center',   // Center text
    flexGrow: 1            // Take full height
  }}>
    <Box sx={{ display: 'flex', justifyContent: 'center', mb: 3 }}>
      {React.cloneElement(icon, { fontSize: 'large', sx: { fontSize: 48 } })}
    </Box>
    
    <Typography 
      component="h2" 
      variant="h5"        // Changed from subtitle2 to h5 for larger size
      gutterBottom
      sx={{ 
        fontWeight: 600,  // Make it bolder
        mb: 2            // More space below title
      }}
    >
      {title}
    </Typography>
    <Typography 
      variant="body2" 
      sx={{ 
        color: 'text.secondary', 
        mb: 2,
        maxWidth: '90%'   // Prevent text from stretching too wide
      }}
    >
      {description}
    </Typography>
  </CardContent>
</Card>
  );
}