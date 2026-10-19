import apiClient from '@/lib/axios';
import { ApiResponse } from '@/types/api';
import { Invitation } from '@/types/entities';
import { UserRole, AuthResponse } from '@/types/auth';

export interface CreateInvitationInput {
  email: string;
  role: UserRole;
}

export interface AcceptInvitationInput {
  token: string;
  fullName: string;
  password: string;
}

export interface VerifyInvitationResponse {
  email: string;
  role: UserRole;
  organizationName: string;
}

export const invitationsApi = {
  async list(): Promise<Invitation[]> {
    const response = await apiClient.get<ApiResponse<Invitation[]>>('/invitations');
    return response.data.data;
  },

  async create(input: CreateInvitationInput): Promise<Invitation> {
    const response = await apiClient.post<ApiResponse<Invitation>>('/invitations', input);
    return response.data.data;
  },

  async revoke(id: string): Promise<void> {
    await apiClient.post(`/invitations/${id}/revoke`);
  },

  async verify(token: string): Promise<VerifyInvitationResponse> {
    const response = await apiClient.get<ApiResponse<VerifyInvitationResponse>>(
      `/invitations/verify/${token}`
    );
    return response.data.data;
  },

  async accept(input: AcceptInvitationInput): Promise<AuthResponse> {
    const response = await apiClient.post<ApiResponse<AuthResponse>>(
      '/invitations/accept',
      input
    );
    return response.data.data;
  },
};

