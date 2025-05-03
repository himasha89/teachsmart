import * as React from 'react';
import type {} from '@mui/x-date-pickers/themeAugmentation';
import type {} from '@mui/x-charts/themeAugmentation';
import type {} from '@mui/x-data-grid/themeAugmentation';
import type {} from '@mui/x-tree-view/themeAugmentation';
import { alpha } from '@mui/material/styles';
import CssBaseline from '@mui/material/CssBaseline';
import Box from '@mui/material/Box';
import Stack from '@mui/material/Stack';
import Typography from '@mui/material/Typography';
import Divider from '@mui/material/Divider';
import AppNavbar from '../components/AppNavbar';
import Header from '../components/Header';
import SideMenu from '../components/SideMenu';
import AppTheme from '../../shared-theme/AppTheme';
import MFAEnrollment from '../../components/MFAEnrollment';
import { useAuth } from '../../app/context/AuthContext';
import {
  chartsCustomizations,
  dataGridCustomizations,
  datePickersCustomizations,
  treeViewCustomizations,
} from '../theme/customizations';

const xThemeComponents = {
  ...chartsCustomizations,
  ...dataGridCustomizations,
  ...datePickersCustomizations,
  ...treeViewCustomizations,
};

export default function Security(props: { disableCustomTheme?: boolean }) {
  const { user } = useAuth();

  const handleMFASuccess = () => {
    // You could show a success message or refresh the page
    console.log('MFA settings updated successfully');
  };

  return (
    <AppTheme {...props} themeComponents={xThemeComponents}>
      <CssBaseline enableColorScheme />
      <Box sx={{ display: 'flex' }}>
        <SideMenu />
        <AppNavbar />
        <Box
            component="main"
            sx={(theme) => ({
              flexGrow: 1,
              backgroundColor: alpha(theme.palette.background.default, 1),
              overflow: 'auto',
            })}
          >
          <Stack
            spacing={2}
            sx={{
              alignItems: 'center',
              mx: 3,
              pb: 5,
              mt: { xs: 8, md: 0 },
            }}
          >
            <Header />
            
            <Box sx={{ width: '100%', maxWidth: 800 }}>
              <Typography variant="h3" sx={{ fontWeight: 700, mb: 2, width: '100%', fontFamily: 'Plus Jakarta Sans, sans-serif' }}>
                Security Settings
              </Typography>
              <Divider sx={{ mb: 4 }} />
              
              {user && (
                <MFAEnrollment 
                  user={user} 
                  onSuccess={handleMFASuccess}
                />
              )}
            </Box>
          </Stack>
        </Box>
      </Box>
    </AppTheme>
  );
}