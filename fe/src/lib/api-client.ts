const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL;

if (!API_BASE_URL) {
  throw new Error('NEXT_PUBLIC_API_URL environment variable is not set');
}

interface ApiResponse<T = any> {
  success: boolean;
  data?: T;
  message?: string;
}

class ApiError extends Error {
  constructor(public status: number, message: string) {
    super(message);
    this.name = 'ApiError';
  }
}

async function apiRequest<T = any>(
  endpoint: string,
  options: RequestInit = {}
): Promise<T> {
  const url = `${API_BASE_URL}${endpoint}`;

  const defaultOptions: RequestInit = {
    credentials: 'include',
    headers: {
      'Content-Type': 'application/json',
    },
  };

  const response = await fetch(url, {
    ...defaultOptions,
    ...options,
    headers: {
      ...defaultOptions.headers,
      ...options.headers,
    },
  });

  let data: ApiResponse<T>;
  try {
    data = await response.json();
  } catch (error) {
    throw new ApiError(response.status, 'Invalid JSON response from server');
  }

  if (!response.ok) {
    throw new ApiError(response.status, data.message || 'An error occurred');
  }

  // The API always returns data in the 'data' field for successful responses
  return data.data as T;
}

export { apiRequest, ApiError };
export type { ApiResponse };