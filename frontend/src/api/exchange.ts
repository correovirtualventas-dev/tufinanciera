import apiClient from './client';

export const getExchangeOperations = () =>
  apiClient.get('/exchange').then(r => r.data);

export const createExchangeOperation = (data: any) =>
  apiClient.post('/exchange', data).then(r => r.data);

export const updateExchangeOperation = (id: number, data: any) =>
  apiClient.patch(`/exchange/${id}`, data).then(r => r.data);

export const deleteExchangeOperation = (id: number) =>
  apiClient.delete(`/exchange/${id}`).then(r => r.data);

export const getExchangeSummary = () =>
  apiClient.get('/exchange/summary').then(r => r.data);
