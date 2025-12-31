import { RouterProvider } from 'react-router-dom';

import { ErrorBoundary } from '@/components';
import { router } from '@/routes';
import { ThemeProvider } from '@/theme';

const App = () => (
  <ThemeProvider>
    <ErrorBoundary>
      <RouterProvider router={router} />
    </ErrorBoundary>
  </ThemeProvider>
);

export default App;
