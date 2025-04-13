import * as React from 'react';
import Grid from '@mui/material/Grid2';
import Box from '@mui/material/Box';
import Stack from '@mui/material/Stack';
import Typography from '@mui/material/Typography';
import StatCard, { StatCardProps } from './StatCard';
import { useRouter } from 'next/navigation';
import { 
  GiSettingsKnobs,
  GiToolbox,
  GiSpeaker,
  GiPadlock,
  GiGraduateCap,
  GiDatabase,
  GiArtificialIntelligence,
  GiCog
} from 'react-icons/gi';

const data: StatCardProps[] = [
  {
    title: 'Profile Settings',
    description: 'Manage your profile information, credentials, and preferences',
    icon: <GiSettingsKnobs size={40} style={{ color: '#4361EE' }} />,
    path: '/dashboard/settings/profile',
  },
  {
    title: 'Interface Settings',
    description: 'Customize theme, font size, and layout preferences',
    icon: <GiToolbox size={40} style={{ color: '#4CC9F0' }} />,
    path: '/dashboard/settings/interface',
  },
  {
    title: 'Notification Center',
    description: 'Configure email and real-time notification preferences',
    icon: <GiSpeaker size={40} style={{ color: '#4895EF' }} />,
    path: '/dashboard/settings/notifications',
  },
  {
    title: 'Security & Privacy',
    description: 'Manage authentication and data privacy settings',
    icon: <GiPadlock size={40} style={{ color: '#F72585' }} />,
    path: '/dashboard/settings/security',
  },
  {
    title: 'Academic Preferences',
    description: 'Set up lesson planning and assessment defaults',
    icon: <GiGraduateCap size={40} style={{ color: '#7209B7' }} />,
    path: '/dashboard/settings/academic',
  },
  {
    title: 'Data Management',
    description: 'Control data sync, backup, and storage options',
    icon: <GiDatabase size={40} style={{ color: '#3A0CA3' }} />,
    path: '/dashboard/settings/data',
  },
  {
    title: 'AI Assistance Settings',
    description: 'Configure TeachBot and document analysis preferences',
    icon: <GiArtificialIntelligence size={40} style={{ color: '#B5179E' }} />,
    path: '/dashboard/settings/ai',
  },
  {
    title: 'System Settings',
    description: 'Manage system performance and integration options',
    icon: <GiCog size={40} style={{ color: '#480CA8' }} />,
    path: '/dashboard/settings/system',
  }
];

export default function TeacherToolsGrid() {
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