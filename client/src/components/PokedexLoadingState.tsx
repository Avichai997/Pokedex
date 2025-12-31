import { Box, CircularProgress } from '@mui/material';
import { Layout } from './Layout';

export const PokedexLoadingState = () => {
  return (
    <Layout>
      <Box
        sx={{
          display: 'flex',
          justifyContent: 'center',
          alignItems: 'center',
          minHeight: '400px',
        }}
      >
        <CircularProgress />
      </Box>
    </Layout>
  );
};

