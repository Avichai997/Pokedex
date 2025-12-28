import { AccountCircle } from '@mui/icons-material';
import { AppBar, Box, Button, Container, Menu, MenuItem, Toolbar, Typography } from '@mui/material';
import { useState } from 'react';
import { Link } from 'react-router-dom';

import { APP_ROUTES } from '@/constants/routes';
import { useCsrfToken, useLogoutMutation } from '@/hooks';
import { useAuthStore } from '@/store';

interface ILayoutProps {
  children: React.ReactNode;
}

export const Layout = ({ children }: ILayoutProps) => {
  const { user } = useAuthStore();
  const logoutMutation = useLogoutMutation();
  const [anchorEl, setAnchorEl] = useState<null | HTMLElement>(null);

  useCsrfToken();

  const handleMenu = (event: React.MouseEvent<HTMLElement>) => {
    setAnchorEl(event.currentTarget);
  };

  const handleClose = () => {
    setAnchorEl(null);
  };

  const handleLogout = () => {
    logoutMutation.mutate();
    handleClose();
  };

  return (
    <Box sx={{ display: 'flex', flexDirection: 'column', minHeight: '100vh' }}>
      <AppBar position='static' className='bg-indigo-600'>
        <Container maxWidth='xl'>
          <Toolbar className='justify-between'>
            <Box className='flex items-center gap-4'>
              <Typography
                variant='h6'
                component={Link}
                to={APP_ROUTES.DASHBOARD}
                className='font-bold text-white no-underline'
                sx={{ textDecoration: 'none', color: 'white' }}
              >
                App Dashboard
              </Typography>
            </Box>
            <Box className='flex items-center gap-2'>
              <Typography variant='body2' className='text-white'>
                {user?.email}
              </Typography>
              <Button
                onClick={handleMenu}
                color='inherit'
                className='text-white'
                startIcon={<AccountCircle />}
              >
                Account
              </Button>
              <Menu anchorEl={anchorEl} open={Boolean(anchorEl)} onClose={handleClose}>
                <MenuItem onClick={handleLogout}>Logout</MenuItem>
              </Menu>
            </Box>
          </Toolbar>
        </Container>
      </AppBar>
      <Box component='main' className='flex-1 bg-gray-50'>
        <Container maxWidth='xl' className='py-8'>
          {children}
        </Container>
      </Box>
    </Box>
  );
};
