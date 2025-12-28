import { useQuery } from '@tanstack/react-query';

import { authApi, setCsrfToken } from '@/api';

export const useCsrfToken = () =>
  useQuery({
    queryKey: ['auth', 'csrf-token'],
    queryFn: async () => {
      const data = await authApi.getCsrfToken();
      setCsrfToken(data.csrfToken);
      return data;
    },
    staleTime: Infinity,
    retry: 1,
  });
