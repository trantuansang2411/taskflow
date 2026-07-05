export interface PaginatedResponse<T> {
  todos: T[];
  total: number;
  page: number;
  limit: number;
  totalPages: number;
}

export interface User {
  id: string;
  username: string;
  email: string;
  role: 'admin' | 'employee';
}

export interface Todo {
  id: string;
  title: string;
  description: string | null;
  status: 'pending' | 'completed';
  created_by: string;
  created_by_name?: string;
  assigned_to: string | null;
  assigned_to_name?: string;
  created_at: string;
  updated_at: string;
}

export interface SuccessResponse<T> {
  status: 'success';
  data: T;
  message?: string;
}

export interface AuthResponse {
  accessToken: string;
  refreshToken: string;
  user: User;
}

export interface LoginPayload {
  email: string;
  password?: string;
}

export interface RegisterPayload {
  username: string;
  email: string;
  password?: string;
}
