import { Box, Card, CardContent, Typography } from '@mui/material';

import { Layout } from '@/components';
import { useAuthStore } from '@/store';

export const DashboardPage = () => {
  const { user } = useAuthStore();

  return (
    <Layout>
      <Typography variant='h4' component='h1' className='mb-6 font-bold'>
        Dashboard
      </Typography>

      <Box className='grid gap-6 md:grid-cols-2'>
        <Card className='shadow-md'>
          <CardContent className='p-6'>
            <Typography variant='h6' className='mb-2 font-semibold'>
              Welcome!
            </Typography>
            <Typography variant='body1' className='text-gray-600'>
              You are logged in as: <strong>{user?.email}</strong>
            </Typography>
          </CardContent>
        </Card>

        <Card className='shadow-md'>
          <CardContent className='p-6'>
            <Typography variant='h6' className='mb-2 font-semibold'>
              Getting Started
            </Typography>
            <Typography variant='body2' className='text-gray-600'>
              This is a template application with user authentication. You can now build your
              application features here.
            </Typography>
          </CardContent>
        </Card>
      </Box>
    </Layout>
  );
};
