import * as React from 'react';
import Grid from '@mui/material/Grid2';
import Box from '@mui/material/Box';
import Stack from '@mui/material/Stack';
import Typography from '@mui/material/Typography';
import StatCard, { StatCardProps } from './StatCard';
import { useRouter } from 'next/navigation';
import { 
  GiTeacher, 
  GiArtificialIntelligence,
  GiRobotGolem, 
  GiProgression,
  GiBookshelf,
  GiSettingsKnobs,
  GiThink,
  GiHistogram
} from 'react-icons/gi';

const data: StatCardProps[] = [
  {
    title: 'Lesson Planning Assistant',
    description: 'Create lesson plans around primary sources with AI support.',
    icon: <GiTeacher size={40} style={{ color: '#FF6B6B' }} />,
    path: '/dashboard/home/lesson-planning',
  },
  {
    title: 'Document Analysis',
    description: 'Analyze historical documents with NLP for insights.',
    icon: <GiArtificialIntelligence size={40} style={{ color: '#4ECDC4' }} />,
    path: '/dashboard/home/document-analysis',
  },
  {
    title: 'TeachBot',
    description: 'Your AI teaching assistant. Ask questions, get lesson ideas, and receive instant support for all your teaching needs.',
    icon: <GiRobotGolem size={40} style={{ color: '#45B7D1' }} />,
    path: '/dashboard/home/teachbot',
  },
];

export default function FavouritesGrid() {
  const router = useRouter();

  const handleCardClick = (path: string) => {
    router.push(path);
  };

  return (
    <Box 
      sx={{ 
        width: '100%',
        minHeight: '100vh',
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        maxWidth: { sm: '100%', md: '1700px' },
        mx: 'auto',
      }}
    >
      <Grid
        container
        spacing={2}
        columns={12}
        sx={{ 
          width: '100%',
          p: 2,
          mb: (theme) => theme.spacing(2)
        }}
      >
        {data.map((card, index) => (
          <Grid 
            key={index} 
            size={{ xs: 12, sm: 6, lg: 3 }}
            onClick={() => handleCardClick(card.path)}
            sx={{
              '& > *': {
                transition: 'all 0.3s ease-in-out',
                cursor: 'pointer',
                position: 'relative',
                background: `linear-gradient(135deg, 
                  rgba(141, 198, 63, 0.05) 0%, 
                  rgba(0, 114, 188, 0.05) 100%
                )`,
                borderWidth: 1,
                borderStyle: 'solid',
                borderColor: 'rgba(141, 198, 63, 0.1)',
                // Lighter hover effects
                '&:hover': {
                  transform: 'translateY(-8px)',
                  boxShadow: '0 8px 24px rgba(0, 114, 188, 0.12)',
                  background: `linear-gradient(135deg, 
                    rgba(141, 198, 63, 0.07) 0%, 
                    rgba(0, 114, 188, 0.07) 100%
                  )`,
                  borderColor: 'rgba(0, 114, 188, 0.15)',
                  '& svg': {
                    transform: 'scale(1.1)',
                    filter: 'brightness(1.2)',
                  },
                  '& .MuiTypography-h6, & .MuiTypography-subtitle1': {
                    color: 'rgba(0, 114, 188, 0.9)',
                  },
                  '& .MuiTypography-body2': {
                    color: 'rgba(141, 198, 63, 0.9)',
                  }
                },
                // Click effects
                '&:active': {
                  transform: 'scale(0.98)',
                  boxShadow: '0 4px 12px rgba(0, 114, 188, 0.08)',
                  background: `linear-gradient(135deg, 
                    rgba(141, 198, 63, 0.1) 0%, 
                    rgba(0, 114, 188, 0.1) 100%
                  )`,
                  '& svg': {
                    transform: 'scale(0.9)',
                  }
                },
                // Transitions
                '& svg': {
                  transition: 'all 0.3s ease-in-out',
                },
                '& .MuiTypography-root': {
                  transition: 'all 0.3s ease-in-out',
                }
              }
            }}
          >
            <StatCard {...card} />
          </Grid>
        ))}
      </Grid>
    </Box>
  );
}