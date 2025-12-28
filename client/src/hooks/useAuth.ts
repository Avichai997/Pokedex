import { useEffect } from 'react';

import { useAuthMe } from '@/hooks';
import { useAuthStore } from '@/store';

export const useAuth = () => {
  const { user, setUser, isAuthenticated } = useAuthStore();

  const { data, isLoading, error } = useAuthMe();

  useEffect(() => {
    if (data) {
      setUser(data);
    }
  }, [data, setUser]);

  return {
    user,
    isAuthenticated: isAuthenticated || !!data,
    isLoading,
    error,
  };
};
