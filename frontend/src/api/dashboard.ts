import apiClient from './client';

export const getAdminMetrics = () =>
  apiClient.get('/dashboard/admin').then(r => r.data);

export const getOverdueLoans = () =>
  apiClient.get('/dashboard/overdue-loans').then(r => r.data);
