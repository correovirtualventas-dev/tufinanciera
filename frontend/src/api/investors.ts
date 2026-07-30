import apiClient from './client';

export const getInvestors = () =>
  apiClient.get('/investors').then(r => r.data);

export const getInvestor = (id: number) =>
  apiClient.get(`/investors/${id}`).then(r => r.data);

export const createInvestor = (data: any) =>
  apiClient.post('/investors', data).then(r => r.data);

export const updateInvestor = (id: number, data: any) =>
  apiClient.patch(`/investors/${id}`, data).then(r => r.data);

export const deleteInvestor = (id: number) =>
  apiClient.delete(`/investors/${id}`).then(r => r.data);

export const getInvestorSummary = (id: number) =>
  apiClient.get(`/investors/${id}/summary`).then(r => r.data);

export const createMovement = (data: any) =>
  apiClient.post('/investors/movements', data).then(r => r.data);

export const deleteMovement = (id: number) =>
  apiClient.delete(`/investors/movements/${id}`).then(r => r.data);

export const getAccruals = (investorId: number) =>
  apiClient.get(`/investors/${investorId}/accruals`).then(r => r.data);

export const recalculateAccruals = (investorId: number, startDate: string, endDate: string) =>
  apiClient.post(`/investors/${investorId}/accruals/recalculate`, { startDate, endDate }).then(r => r.data);

export const deleteAccrual = (id: number) =>
  apiClient.delete(`/investors/accruals/${id}`).then(r => r.data);

export const createPayout = (data: any) =>
  apiClient.post('/investors/payouts', data).then(r => r.data);

export const deletePayout = (id: number) =>
  apiClient.delete(`/investors/payouts/${id}`).then(r => r.data);

export const setInvestorPassword = (id: number, password: string) =>
  apiClient.patch(`/investors/${id}/password`, { password }).then(r => r.data);
