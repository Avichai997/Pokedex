import { AppBar, Box, Container, Toolbar, Typography } from '@mui/material';
import { Link } from 'react-router-dom';

import { APP_ROUTES } from '@/constants';
import { ThemeToggle } from './ThemeToggle';

interface ILayoutProps {
  children: React.ReactNode;
}

export const Layout = ({ children }: ILayoutProps) => {
  return (
    <Box sx={{ display: 'flex', flexDirection: 'column', minHeight: '100vh' }}>
      <AppBar position='static' className='bg-indigo-600'>
        <Container maxWidth='xl'>
          <Toolbar className='justify-between'>
            <Box className='flex items-center gap-4'>
              <Typography
                variant='h6'
                component={Link}
                to={APP_ROUTES.POKEDEX}
                className='font-bold text-white no-underline'
                sx={{ textDecoration: 'none', color: 'white' }}
              >
                Pokédex
              </Typography>
            </Box>
            <ThemeToggle />
          </Toolbar>
        </Container>
      </AppBar>
      <Box
        component='main'
        className='flex-1'
        sx={{
          backgroundColor: (theme) => theme.palette.background.default,
          minHeight: '100%',
        }}
      >
        <Container maxWidth='xl' className='py-8'>
          {children}
        </Container>
      </Box>
    </Box>
  );
};
