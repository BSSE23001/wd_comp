import { useAuth } from "@clerk/nextjs";

const API_BASE_URL =
  process.env.NEXT_PUBLIC_API_URL || "http://localhost:3001/api";

export function useApiClient() {
  const { getToken } = useAuth();

  const fetchWithAuth = async (endpoint: string, options: RequestInit = {}) => {
    const token = await getToken();

    const headers = {
      "Content-Type": "application/json",
      ...(token ? { Authorization: `Bearer ${token}` } : {}),
      ...options.headers,
    };

    const response = await fetch(`${API_BASE_URL}${endpoint}`, {
      ...options,
      headers,
    });

    const data = await response.json();

    if (!response.ok) {
      console.error("❌ API ERROR:", data); // ADD THIS
      throw new Error(data.message || "An error occurred while fetching data");
    }

    return data; // Returns the ApiResponse format from our Express backend
  };

  return {
    get: (endpoint: string) => fetchWithAuth(endpoint, { method: "GET" }),
    post: (endpoint: string, body: unknown) =>
      fetchWithAuth(endpoint, { method: "POST", body: JSON.stringify(body) }),
    put: (endpoint: string, body: unknown) =>
      fetchWithAuth(endpoint, { method: "PUT", body: JSON.stringify(body) }),
    delete: (endpoint: string) => fetchWithAuth(endpoint, { method: "DELETE" }),
  };
}
