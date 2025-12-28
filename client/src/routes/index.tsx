import { createBrowserRouter, Navigate } from 'react-router-dom';

import { ProtectedRoute, RouteErrorElement } from '@/components';
import { APP_ROUTES } from '@/constants/routes';
import { AuthPage, DashboardPage } from '@/pages';

export const router = createBrowserRouter([
  {
    path: APP_ROUTES.LOGIN,
    element: <AuthPage />,
    errorElement: <RouteErrorElement />,
  },
  {
    path: APP_ROUTES.REGISTER,
    element: <AuthPage />,
    errorElement: <RouteErrorElement />,
  },
  {
    path: APP_ROUTES.HOME,
    element: (
      <ProtectedRoute>
        <Navigate to={APP_ROUTES.DASHBOARD} replace />
      </ProtectedRoute>
    ),
    errorElement: <RouteErrorElement />,
  },
  {
    path: APP_ROUTES.DASHBOARD,
    element: (
      <ProtectedRoute>
        <DashboardPage />
      </ProtectedRoute>
    ),
    errorElement: <RouteErrorElement />,
  },
  {
    path: '*',
    element: <Navigate to={APP_ROUTES.DASHBOARD} replace />,
    errorElement: <RouteErrorElement />,
  },
]);
