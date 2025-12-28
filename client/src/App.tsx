import { RouterProvider } from 'react-router-dom';

import { ErrorBoundary } from '@/components';
import { router } from '@/routes';

const App = () => (
  <ErrorBoundary>
    <RouterProvider router={router} />
  </ErrorBoundary>
);

export default App;
