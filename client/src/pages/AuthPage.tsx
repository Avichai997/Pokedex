import { useLocation } from 'react-router-dom';

import { AuthForm } from '@/components';
import { APP_ROUTES } from '@/constants/routes';

export const AuthPage = () => {
  const location = useLocation();
  const isLogin = location.pathname === APP_ROUTES.LOGIN;

  return <AuthForm isLogin={isLogin} />;
};
