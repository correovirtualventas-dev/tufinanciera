import apiClient from './client';

export const getLoans = (params?: { status?: string; clientId?: number; search?: string }) =>
  apiClient.get('/loans', { params }).then(r => r.data);

export const getLoan = (id: number) =>
  apiClient.get(`/loans/${id}`).then(r => r.data);

export const createLoan = (data: any) =>
  apiClient.post('/loans', data).then(r => r.data);

export const updateLoanStatus = (id: number, status: string) =>
  apiClient.patch(`/loans/${id}/status`, { status }).then(r => r.data);

export const deleteLoan = (id: number) =>
  apiClient.delete(`/loans/${id}`).then(r => r.data);

export const getAmortization = (id: number) =>
  apiClient.get(`/loans/${id}/amortization-data`).then(r => r.data);

export const getAmortizationPdf = (id: number) =>
  apiClient.get(`/loans/${id}/amortization`, { responseType: 'blob' }).then(r => r.data);
