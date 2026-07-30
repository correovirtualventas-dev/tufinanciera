import apiClient from './client';

export const getClients = (params?: { search?: string; active?: boolean }) =>
  apiClient.get('/clients', { params }).then(r => r.data);

export const getClient = (id: number) =>
  apiClient.get(`/clients/${id}`).then(r => r.data);

export const getClientLoans = (id: number) =>
  apiClient.get(`/clients/${id}/loans`).then(r => r.data);

export const createClient = (data: any) =>
  apiClient.post('/clients', data).then(r => r.data);

export const updateClient = (id: number, data: any) =>
  apiClient.patch(`/clients/${id}`, data).then(r => r.data);

export const toggleClientActive = (id: number) =>
  apiClient.patch(`/clients/${id}/toggle-active`).then(r => r.data);

export const deleteClient = (id: number) =>
  apiClient.delete(`/clients/${id}`).then(r => r.data);

export const setClientPassword = (id: number, password: string) =>
  apiClient.post(`/clients/${id}/password`, { password }).then(r => r.data);

export const addDocument = (clientId: number, data: any) =>
  apiClient.post(`/clients/${clientId}/documents`, data).then(r => r.data);

export const deleteDocument = (clientId: number, docId: number) =>
  apiClient.delete(`/clients/${clientId}/documents/${docId}`).then(r => r.data);

export const addGuarantee = (clientId: number, data: any) =>
  apiClient.post(`/clients/${clientId}/guarantees`, data).then(r => r.data);

export const deleteGuarantee = (clientId: number, guaranteeId: number) =>
  apiClient.delete(`/clients/${clientId}/guarantees/${guaranteeId}`).then(r => r.data);

export const addRelationship = (clientId: number, data: any) =>
  apiClient.post(`/clients/${clientId}/relationships`, data).then(r => r.data);

export const deleteRelationship = (clientId: number, relId: number) =>
  apiClient.delete(`/clients/${clientId}/relationships/${relId}`).then(r => r.data);
