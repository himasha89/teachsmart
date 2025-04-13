import * as React from 'react';
import { styled } from '@mui/material/styles';
import Avatar from '@mui/material/Avatar';
import MuiDrawer, { drawerClasses } from '@mui/material/Drawer';
import Box from '@mui/material/Box';
import Divider from '@mui/material/Divider';
import Stack from '@mui/material/Stack';
import Typography from '@mui/material/Typography';
import List from '@mui/material/List';
import ListItem from '@mui/material/ListItem';
import ListItemButton from '@mui/material/ListItemButton';
import ListItemIcon from '@mui/material/ListItemIcon';
import ListItemText from '@mui/material/ListItemText';
import HomeRoundedIcon from '@mui/icons-material/HomeRounded';
import FavoriteRoundedIcon from '@mui/icons-material/FavoriteRounded';
import SettingsRoundedIcon from '@mui/icons-material/SettingsRounded';
import InfoRoundedIcon from '@mui/icons-material/InfoRounded';
import SchoolRoundedIcon from '@mui/icons-material/SchoolRounded';
import MenuBookRoundedIcon from '@mui/icons-material/MenuBookRounded';
import { usePathname } from 'next/navigation';
import Link from 'next/link';
import OptionsMenu from './OptionsMenu';
import { useAuth } from '../../app/context/AuthContext';

const drawerWidth = 240;

const Drawer = styled(MuiDrawer)({
  width: drawerWidth,
  flexShrink: 0,
  boxSizing: 'border-box',
  mt: 10,
  [`& .${drawerClasses.paper}`]: {
    width: drawerWidth,
    boxSizing: 'border-box',
  },
});

export default function SideMenu() {
  const pathname = usePathname();
  const { user } = useAuth(); // Add this hook

  // Function to get display name from email
  const getDisplayName = (email: string) => {
    const name = email.split('@')[0];
    // Capitalize first letter of each word and replace dots/underscores with spaces
    return name
      .split(/[._]/)
      .map(word => word.charAt(0).toUpperCase() + word.slice(1))
      .join(' ');
  };

  const displayName = user?.email ? getDisplayName(user.email) : 'User';
  const userEmail = user?.email || 'user@example.com';

  const menuItems = [
    { text: 'Home', icon: <HomeRoundedIcon />, path: '/dashboard/home' },
    { text: 'Favourites', icon: <FavoriteRoundedIcon />, path: '/dashboard/favourites' },
    { text: 'Teacher Tools', icon: <SchoolRoundedIcon />, path: '/dashboard/teachertools' },
    { text: 'Classroom Tools', icon: <MenuBookRoundedIcon />, path: '/dashboard/classroomtools' },
    { text: 'Settings', icon: <SettingsRoundedIcon />, path: '/dashboard/settings' },
    { text: 'About', icon: <InfoRoundedIcon />, path: '/dashboard/about' }
  ];

  return (
    <Drawer
      variant="permanent"
      sx={{
        display: { xs: 'none', md: 'block' },
        [`& .${drawerClasses.paper}`]: {
          backgroundColor: 'background.paper',
        },
      }}
    >
      <Stack
        direction="row"
        sx={{
          p: 2,
          gap: 2,  // Increased gap from 1 to 2
          alignItems: 'center',
          borderTop: '1px solid',
          borderColor: 'divider',
        }}
      >
        <Avatar
          sizes="small"
          alt={displayName}
          src="/static/images/avatar/7.jpg"
          sx={{ width: 36, height: 36 }}
        />
        <Box sx={{ 
          mr: 'auto',
          minWidth: 0,  // Added to prevent text overflow
          flex: 1       // Added to allow text to shrink
        }}>
          <Typography 
            variant="body2" 
            sx={{ 
              fontWeight: 500, 
              lineHeight: '16px',
              overflow: 'hidden',
              textOverflow: 'ellipsis',
              whiteSpace: 'nowrap'
            }}
          >
            {displayName}
          </Typography>
          <Typography 
            variant="caption" 
            sx={{ 
              color: 'text.secondary',
              overflow: 'hidden',
              textOverflow: 'ellipsis',
              whiteSpace: 'nowrap',
              display: 'block'
            }}
          >
            {userEmail}
          </Typography>
        </Box>
        <OptionsMenu />
      </Stack>
      <Divider />
      {/* Rest of the component remains the same */}
      <Box sx={{ mt: 1 }}>
        <List>
          {menuItems.map(({ text, icon, path }) => (
            <Link
              key={text}
              href={path}
              style={{ textDecoration: 'none', color: 'inherit' }}
            >
              <ListItem disablePadding>
                <ListItemButton
                  selected={pathname === path}
                  sx={(theme) => ({
                    py: 1.5,
                    '&.Mui-selected': {
                      backgroundColor: 'action.selected',
                      color: 'primary.main',
                      '&:hover': {
                        backgroundColor: 'action.selected',
                      },
                      '& .MuiListItemIcon-root': {
                        color: 'primary.main',
                      },
                    },
                  })}
                >
                  <ListItemIcon
                    sx={{
                      minWidth: 32,
                      color: pathname === path ? 'primary.main' : 'action.active',
                    }}
                  >
                    {icon}
                  </ListItemIcon>
                  <ListItemText
                    primary={text}
                    primaryTypographyProps={{
                      fontWeight: pathname === path ? 600 : 400,
                    }}
                  />
                </ListItemButton>
              </ListItem>
            </Link>
          ))}
        </List>
      </Box>
    </Drawer>
  );
}