import * as React from 'react';
import Stack from '@mui/material/Stack';
import Typography from '@mui/material/Typography';
import Image from 'next/image';
import NotificationsRoundedIcon from '@mui/icons-material/NotificationsRounded';
import CustomDatePicker from './CustomDatePicker';
import NavbarBreadcrumbs from './NavbarBreadcrumbs';
import MenuButton from './MenuButton';
import ColorModeIconDropdown from '../../shared-theme/ColorModeIconDropdown';
import Search from './Search';

export default function Header() {
  return (
    <Stack
      direction="row"
      sx={{
        display: { xs: 'none', md: 'flex' },
        width: '100%',
        alignItems: { xs: 'flex-start', md: 'center' },
        justifyContent: 'space-between',
        maxWidth: { sm: '100%', md: '1700px' },
        pt: 2,
        pb: 2,
        height: '80px',
      }}
      spacing={2}
    >
      {/* Breadcrumbs */}
      <NavbarBreadcrumbs />

      {/* Centered Logo and Name */}
      <Stack
        direction="row"
        alignItems="center"
        spacing={1}
        sx={{
          position: 'absolute',
          left: '50%',
          transform: 'translateX(-50%)',
          display: 'flex',
          justifyContent: 'center',
          width: 'auto',
          height: '60px',
        }}
      >
        <div style={{ 
          position: 'relative',
          height: '60px',
          width: '200px', // Set a fixed width container
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center'
        }}>
          <Image 
            src="/icon.png" 
            alt="TeachSmart Logo"
            fill
            style={{
              objectFit: 'contain',
            }}
            priority
          />
        </div>
      </Stack>
    </Stack>
  );
}