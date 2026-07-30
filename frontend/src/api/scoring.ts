import apiClient from './client';

export const checkBcra = (dni: string) =>
  apiClient.get('/scoring/bcra', { params: { dni } }).then(r => r.data);

export const simulateScore = (factors: any) =>
  apiClient.post('/scoring/simulate', factors).then(r => r.data);

export const recalculateScore = (clientId: number) =>
  apiClient.post(`/scoring/recalculate/${clientId}`).then(r => r.data);

export const getScoreDetails = (clientId: number) =>
  apiClient.get(`/scoring/details/${clientId}`).then(r => r.data);
