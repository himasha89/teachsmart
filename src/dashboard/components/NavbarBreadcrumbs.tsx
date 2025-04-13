import * as React from 'react';
import { usePathname } from 'next/navigation';
import Typography from '@mui/material/Typography';
import Breadcrumbs, { breadcrumbsClasses } from '@mui/material/Breadcrumbs';
import NavigateNextRoundedIcon from '@mui/icons-material/NavigateNextRounded';
import { styled } from '@mui/material/styles';
import Link from 'next/link';
import Box from '@mui/material/Box';

const StyledBreadcrumbs = styled(Breadcrumbs)(({ theme }) => ({
  margin: theme.spacing(1, 0),
  ['& .' + breadcrumbsClasses.separator]: {
    color: theme.palette.action.disabled,
    margin: 1,
  },
  ['& .' + breadcrumbsClasses.ol]: {
    alignItems: 'center',
  },
}));

export default function NavbarBreadcrumbs() {
  const pathname = usePathname();
  const pathSegments = pathname.split('/').filter(Boolean).filter(segment => segment !== 'dashboard');

  const getBreadcrumbText = (segment: string) => {
    if (segment.includes('-')) {
      return segment
        .split('-')
        .map(word => word.charAt(0).toUpperCase() + word.slice(1))
        .join(' ');
    }

    switch (segment) {
      case 'home':
        return 'Home';
      default:
        return segment.charAt(0).toUpperCase() + segment.slice(1);
    }
  };

  return (
    <Box sx={{ display: 'flex', alignItems: 'center' }}>
      <Typography 
        variant="body1" 
        sx={{ color: 'text.secondary', mr: 1 }}
      >
        |
      </Typography>
      <StyledBreadcrumbs
        aria-label="breadcrumb"
        separator={<NavigateNextRoundedIcon fontSize="small" />}
      >
        {pathSegments.map((segment, index) => {
          const path = `/dashboard/${pathSegments.slice(0, index + 1).join('/')}`;
          const isLast = index === pathSegments.length - 1;

          return isLast ? (
            <Typography
              key={segment}
              variant="body1"
              sx={{ color: 'text.primary', fontWeight: 600 }}
            >
              {getBreadcrumbText(segment)}
            </Typography>
          ) : (
            <Link
              key={segment}
              href={path}
              style={{ textDecoration: 'none', color: 'inherit' }}
            >
              <Typography variant="body1">
                {getBreadcrumbText(segment)}
              </Typography>
            </Link>
          );
        })}
      </StyledBreadcrumbs>
    </Box>
  );
}
