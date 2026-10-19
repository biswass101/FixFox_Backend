export type UserRole = 'ADMIN' | 'MANAGER' | 'TECHNICIAN' | 'REPORTER';

export interface OrganizationSummary {
  id: string;
  name: string;
  slug: string;
  defaultCurrency: string;
}

export interface User {
  id: string;
  email: string;
  fullName: string;
  role: UserRole;
  phone?: string | null;
  skills: string[];
  organization: OrganizationSummary;
}

export interface AuthResponse {
  user: User;
  accessToken: string;
}

