import apiClient from './client';

export const login = async (nameOrEmail: string, password: string) => {
  const { data } = await apiClient.post('/auth/login', { nameOrEmail, password });
  return data;
};

export const investorLogin = async (dni: string, password: string) => {
  const { data } = await apiClient.post('/auth/investor-login', { dni, password });
  return data;
};

export const clientLogin = async (dni: string, password: string) => {
  const { data } = await apiClient.post('/auth/client-login', { dni, password });
  return data;
};

export const getProfile = async () => {
  const { data } = await apiClient.get('/auth/profile');
  return data;
};
