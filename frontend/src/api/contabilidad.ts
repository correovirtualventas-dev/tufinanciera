import apiClient from './client';

export const getAccountingSummary = () =>
  apiClient.get('/accounting/summary').then(r => r.data);

export const getAccountingMovements = (params?: any) =>
  apiClient.get('/accounting/movements', { params }).then(r => r.data);

export const createExpense = (data: any) =>
  apiClient.post('/accounting/expenses', data).then(r => r.data);

export const getExpenseCategories = () =>
  apiClient.get('/accounting/categories').then(r => r.data);

export const createExpenseCategory = (name: string) =>
  apiClient.post('/accounting/categories', { name }).then(r => r.data);

export const deleteExpenseCategory = (id: number) =>
  apiClient.delete(`/accounting/categories/${id}`).then(r => r.data);
