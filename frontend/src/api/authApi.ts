import axiosClient from './axiosClient';
import type { RegisterPayload, LoginPayload, AuthResponse, SuccessResponse } from './types';

export const authApi = {
  register: (data: RegisterPayload): Promise<SuccessResponse<{ user: any }>> => 
    axiosClient.post('/auth/register', data),

  login: (data: LoginPayload): Promise<SuccessResponse<AuthResponse>> => 
    axiosClient.post('/auth/login', data),

  logout: (refreshToken: string): Promise<SuccessResponse<null>> => 
    axiosClient.post('/auth/logout', { refreshToken }),
};
