import axiosClient from './axiosClient';
import type { Todo, User, PaginatedResponse } from './types';
import type { SuccessResponse } from './types';

export const todoApi = {
  getAll: (params?: { status?: string; search?: string; page?: number; limit?: number }): Promise<SuccessResponse<PaginatedResponse<Todo>>> => 
    axiosClient.get('/todos', { params }),
    
  getById: (id: string): Promise<SuccessResponse<{ todo: Todo }>> => 
    axiosClient.get(`/todos/${id}`),

  create: (data: { title: string; description?: string }): Promise<SuccessResponse<{ todo: Todo }>> => 
    axiosClient.post('/todos', data),

  update: (id: string, data: { title: string; description?: string }): Promise<SuccessResponse<{ todo: Todo }>> => 
    axiosClient.put(`/todos/${id}`, data),

  delete: (id: string): Promise<SuccessResponse<null>> => 
    axiosClient.delete(`/todos/${id}`),

  toggleStatus: (id: string): Promise<SuccessResponse<{ todo: Todo }>> => 
    axiosClient.patch(`/todos/${id}/status`),

  assign: (id: string, assignedTo: string): Promise<SuccessResponse<{ todo: Todo }>> => 
    axiosClient.patch(`/todos/${id}/assign`, { assignedTo }),

  getEmployees: (): Promise<SuccessResponse<{ employees: User[] }>> => 
    axiosClient.get('/todos/meta/employees'),
};
