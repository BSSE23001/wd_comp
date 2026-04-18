import { apiRequest, ApiError } from '@/lib/api-client';

export interface LoginCredentials {
  email: string;
  password: string;
}

export interface SignupData {
  email: string;
  password: string;
  role: 'WORKER' | 'VERIFIER';
  first_name: string;
  last_name: string;
}

export interface AuthResponse {
  accessToken: string;
  user: {
    id: string;
    email: string;
    role: string;
    first_name: string;
    last_name: string;
    is_approved_by_advocate?: boolean;
  };
}

export interface AuthError {
  message: string;
  status?: number;
}

export async function login(credentials: LoginCredentials): Promise<AuthResponse> {
  try {
    const response = await apiRequest<AuthResponse>('/api/auth/login', {
      method: 'POST',
      body: JSON.stringify(credentials),
    });
    return response;
  } catch (error) {
    if (error instanceof ApiError) {
      throw {
        message: error.message,
        status: error.status,
      } as AuthError;
    }
    throw {
      message: 'An unexpected error occurred',
    } as AuthError;
  }
}

export async function signup(userData: SignupData): Promise<void> {
  try {
    await apiRequest('/api/auth/signup', {
      method: 'POST',
      body: JSON.stringify(userData),
    });
  } catch (error) {
    if (error instanceof ApiError) {
      throw {
        message: error.message,
        status: error.status,
      } as AuthError;
    }
    throw {
      message: 'An unexpected error occurred',
    } as AuthError;
  }
}