import { createBrowserRouter, Navigate } from 'react-router-dom';

import { RouteErrorElement } from '@/components';
import { APP_ROUTES } from '@/constants';
import { PokedexPage } from '@/pages';

export const router = createBrowserRouter([
  {
    path: APP_ROUTES.HOME,
    element: <Navigate to={APP_ROUTES.POKEDEX} replace />,
    errorElement: <RouteErrorElement />,
  },
  {
    path: APP_ROUTES.POKEDEX,
    element: <PokedexPage />,
    errorElement: <RouteErrorElement />,
  },
  {
    path: '*',
    element: <Navigate to={APP_ROUTES.POKEDEX} replace />,
    errorElement: <RouteErrorElement />,
  },
]);
