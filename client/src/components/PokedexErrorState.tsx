import { Alert } from '@mui/material';
import { Layout } from './Layout';

export const PokedexErrorState = () => {
  return (
    <Layout>
      <Alert severity='error'>Failed to load Pokemon. Please try again later.</Alert>
    </Layout>
  );
};

