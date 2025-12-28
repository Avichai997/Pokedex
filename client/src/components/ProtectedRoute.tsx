import { Navigate } from 'react-router-dom';

import { APP_ROUTES } from '@/constants/routes';
import { useAuth } from '@/hooks';

interface IProtectedRouteProps {
  children: React.ReactNode;
}

export const ProtectedRoute = ({ children }: IProtectedRouteProps) => {
  const { isAuthenticated, isLoading } = useAuth();

  if (isLoading) {
    return (
      <div className='flex min-h-screen items-center justify-center'>
        <div className='text-lg'>Loading...</div>
      </div>
    );
  }

  if (!isAuthenticated) {
    return <Navigate to={APP_ROUTES.LOGIN} replace />;
  }

  return <>{children}</>;
};
