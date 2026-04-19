"use server";

import { cookies } from "next/headers";
import { revalidatePath } from "next/cache";

const AUTH_SERVICE_URL = process.env.AUTH_USERS_URL || "http://localhost:5000/api/users";
const EARNINGS_SERVICE_URL = process.env.EARNINGS_API_URL
  ? `${process.env.EARNINGS_API_URL}/earnings`
  : "http://localhost:4001/api/earnings";
const GRIEVANCES_SERVICE_URL = process.env.GRIEVANCES_SERVICE_URL || "http://localhost:4004/api/grievances";
const ANALYTICS_SERVICE_URL = process.env.ANALYTICS_SERVICE_URL || "http://localhost:4005/api/analytics";
const INTERNAL_API_KEY = process.env.INTERNAL_API_KEY || "";

async function getHeaders() {
  const cookieStore = await cookies();
  const token = cookieStore.get("accessToken")?.value;
  return {
    Authorization: `Bearer ${token}`,
    "Content-Type": "application/json",
    "x-internal-api-key": INTERNAL_API_KEY,
  };
}

export async function fetchVerifiers() {
  const headers = await getHeaders();
  try {
    const res = await fetch(`${AUTH_SERVICE_URL}/advocate/verifiers`, { headers });
    if (!res.ok) return { success: false, error: "Failed to fetch verifiers" };
    const data = await res.json();
    return { success: true, data: data.data }; // Assume standard response format { success, message, data }
  } catch (error) {
    return { success: false, error: "Network error" };
  }
}

export async function updateVerifierStatus(id: string, status: "APPROVED" | "REJECTED") {
  const headers = await getHeaders();
  try {
    const res = await fetch(`${AUTH_SERVICE_URL}/advocate/verifiers/${id}/status`, {
      method: "PATCH",
      headers,
      body: JSON.stringify({ status }),
    });
    if (!res.ok) return { success: false, error: "Failed to update verifier" };
    revalidatePath("/advocate/verifiers");
    return { success: true };
  } catch (error) {
    return { success: false, error: "Network error" };
  }
}

export async function fetchPlatforms() {
  const headers = await getHeaders();
  try {
    // Platform fetch can be from earnings service, but earnings needs token
    // Actually, GET /api/earnings/platforms is public or worker? The docs say worker.
    // We can fetch it or get it directly from prisma in a server component.
    // Wait, the API for Advocate is POST /platforms and PATCH /platforms/:id/toggle.
    // To list platforms, maybe we should just use Prisma directly or expose a GET route.
    // Let's assume there is a GET /platforms route for advocate.
    // Or we can just read from DB directly here since Next.js can access Prisma.
    // But to respect microservices, we should use API.
    // I will expose a GET /platforms in Advocate Controller if it doesn't exist, or just use the worker one.
    const res = await fetch(`${EARNINGS_SERVICE_URL}/platforms`, { headers });
    if (!res.ok) return { success: false, error: "Failed to fetch platforms" };
    const data = await res.json();
    return { success: true, data };
  } catch (error) {
    return { success: false, error: "Network error" };
  }
}

export async function addPlatform(name: string) {
  const headers = await getHeaders();
  try {
    const res = await fetch(`${EARNINGS_SERVICE_URL}/platforms`, {
      method: "POST",
      headers,
      body: JSON.stringify({ name }),
    });
    if (!res.ok) {
      const err = await res.json();
      return { success: false, error: err.message || "Failed to add platform" };
    }
    revalidatePath("/advocate/platforms");
    return { success: true };
  } catch (error) {
    return { success: false, error: "Network error" };
  }
}

export async function togglePlatform(id: string) {
  const headers = await getHeaders();
  try {
    const res = await fetch(`${EARNINGS_SERVICE_URL}/platforms/${id}/toggle`, {
      method: "PATCH",
      headers,
    });
    if (!res.ok) return { success: false, error: "Failed to toggle platform" };
    revalidatePath("/advocate/platforms");
    return { success: true };
  } catch (error) {
    return { success: false, error: "Network error" };
  }
}

export async function fetchGrievances() {
  const headers = await getHeaders();
  try {
    const res = await fetch(GRIEVANCES_SERVICE_URL, { headers });
    if (!res.ok) return { success: false, error: "Failed to fetch grievances" };
    const data = await res.json();
    return { success: true, data };
  } catch (error) {
    return { success: false, error: "Network error" };
  }
}

export async function fetchClusters() {
  const headers = await getHeaders();
  try {
    const res = await fetch(`${GRIEVANCES_SERVICE_URL}/clusters`, { headers });
    if (!res.ok) return { success: false, error: "Failed to fetch clusters" };
    const data = await res.json();
    return { success: true, data };
  } catch (error) {
    return { success: false, error: "Network error" };
  }
}

export async function updateGrievanceStatus(id: string, status: "ESCALATED" | "RESOLVED") {
  const headers = await getHeaders();
  try {
    const res = await fetch(`${GRIEVANCES_SERVICE_URL}/${id}/status`, {
      method: "PATCH",
      headers,
      body: JSON.stringify({ status }),
    });
    if (!res.ok) return { success: false, error: "Failed to update status" };
    revalidatePath("/advocate/grievances");
    return { success: true };
  } catch (error) {
    return { success: false, error: "Network error" };
  }
}

export async function createCluster(name: string) {
  const headers = await getHeaders();
  try {
    const res = await fetch(`${GRIEVANCES_SERVICE_URL}/clusters`, {
      method: "POST",
      headers,
      body: JSON.stringify({ name }),
    });
    if (!res.ok) return { success: false, error: "Failed to create cluster" };
    const data = await res.json();
    revalidatePath("/advocate/grievances");
    return { success: true, data };
  } catch (error) {
    return { success: false, error: "Network error" };
  }
}

export async function addGrievanceToCluster(clusterId: string, postId: string) {
  const headers = await getHeaders();
  try {
    const res = await fetch(`${GRIEVANCES_SERVICE_URL}/clusters/${clusterId}/add-post`, {
      method: "PATCH",
      headers,
      body: JSON.stringify({ postId }),
    });
    if (!res.ok) return { success: false, error: "Failed to add to cluster" };
    revalidatePath("/advocate/grievances");
    return { success: true };
  } catch (error) {
    return { success: false, error: "Network error" };
  }
}
