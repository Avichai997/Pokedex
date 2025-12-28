import { ILoginDto, IRegisterDto, IUser } from '@/types';

import api from './axios';

export const authApi = {
  register: async (data: IRegisterDto): Promise<IUser> => {
    const response = await api.post('/auth/register', data);
    return response.data;
  },

  login: async (data: ILoginDto): Promise<{ user: IUser }> => {
    const response = await api.post('/auth/login', data);
    return response.data;
  },

  logout: async (): Promise<void> => {
    await api.post('/auth/logout');
  },

  getMe: async (): Promise<IUser> => {
    const response = await api.get('/auth/me');
    return response.data;
  },

  getCsrfToken: async (): Promise<{ csrfToken: string }> => {
    const response = await api.get('/auth/csrf-token');
    return response.data;
  },
};
