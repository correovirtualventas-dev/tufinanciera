import apiClient from './client';

export const registerPayment = (data: any) =>
  apiClient.post('/payments', data).then(r => r.data);

export const getPaymentsByLoan = (loanId: number) =>
  apiClient.get(`/payments/loan/${loanId}`).then(r => r.data);

export const getRecentPayments = (limit?: number) =>
  apiClient.get('/payments/recent', { params: { limit } }).then(r => r.data);
