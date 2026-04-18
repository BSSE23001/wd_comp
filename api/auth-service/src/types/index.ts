export type UserRole = 'WORKER' | 'VERIFIER' | 'ADVOCATE';

export interface User {
  id: string;
  email: string;
  password_hash: string;
  role: UserRole;
  is_approved_by_advocate: boolean;
  first_name?: string;
  last_name?: string;
  phone_number?: string;
  profile_photo_url?: string;
  created_at: Date;
  updated_at: Date;
}

export interface JWTPayload {
  id: string;
  email: string;
  role: UserRole;
}

export interface AuthResponse {
  accessToken: string;
  user: {
    id: string;
    email: string;
    role: UserRole;
    first_name?: string;
    last_name?: string;
  };
}

export interface SignUpPayload {
  email: string;
  password: string;
  role: UserRole;
  first_name?: string;
  last_name?: string;
}

export interface LoginPayload {
  email: string;
  password: string;
}

export interface UpdateUserPayload {
  first_name?: string;
  last_name?: string;
  phone_number?: string;
  profile_photo_url?: string;
}
