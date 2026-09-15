import React from 'react';
import { useLocation, Link as RouterLink } from 'react-router-dom';
import Breadcrumbs from '@mui/material/Breadcrumbs';
import Typography from '@mui/material/Typography';
import Link from '@mui/material/Link';
import NavigateNextIcon from '@mui/icons-material/NavigateNext';

export default function AppBreadcrumbs() {
  const location = useLocation();
  const pathnames = location.pathname.split('/').filter((x) => x);

  // Helper to format path segments into readable text
  const formatName = (name) => {
    return name
      .split('-')
      .map((word) => word.charAt(0).toUpperCase() + word.slice(1))
      .join(' ');
  };

  if (pathnames.length === 0) {
    // We are on the root/dashboard, breadcrumb could be just "Dashboard"
    return (
      <div>
        <Breadcrumbs separator={<NavigateNextIcon fontSize="small" />} aria-label="breadcrumb">
          <Typography sx={{ color: 'text.primary', fontSize: '13px', fontWeight: 600 }}>
            Dashboard
          </Typography>
        </Breadcrumbs>
      </div>
    );
  }

  return (
    <div>
      <Breadcrumbs separator={<NavigateNextIcon fontSize="small" />} aria-label="breadcrumb">
        <Link 
          component={RouterLink}
          underline="hover"
          color="inherit" 
          to="/" 
          sx={{ fontSize: '13px', color: '#6b7280', '&:hover': { color: '#1b7f43' } }}
        >
          Dashboard
        </Link>
        {pathnames.map((value, index) => {
          const isLast = index === pathnames.length - 1;
          const to = `/${pathnames.slice(0, index + 1).join('/')}`;
          const label = formatName(value);

          return isLast ? (
            <Typography key={to} sx={{ color: 'text.primary', fontSize: '13px', fontWeight: 600 }}>
              {label}
            </Typography>
          ) : (
            <Link 
              key={to} 
              component={RouterLink}
              underline="hover"
              color="inherit" 
              to={to} 
              sx={{ fontSize: '13px', color: '#6b7280', '&:hover': { color: '#1b7f43' } }}
            >
              {label}
            </Link>
          );
        })}
      </Breadcrumbs>
    </div>
  );
}
