"use server";

import { cookies } from "next/headers";
import { revalidatePath } from "next/cache";

const GRIEVANCES_SERVICE_URL = process.env.GRIEVANCES_SERVICE_URL || "http://localhost:4004/api/grievances";
const EARNINGS_SERVICE_URL = process.env.EARNINGS_API_URL ? `${process.env.EARNINGS_API_URL}/earnings` : "http://localhost:4001/api/earnings";

async function getHeaders() {
  const cookieStore = await cookies();
  const token = cookieStore.get("accessToken")?.value;
  return {
    Authorization: `Bearer ${token}`,
    "Content-Type": "application/json",
  };
}

export async function fetchPublicGrievances(search?: string, tags?: string, sort: string = "desc") {
  try {
    const params = new URLSearchParams();
    if (search) params.append("search", search);
    if (tags) params.append("tags", tags);
    params.append("sort", sort);

    const res = await fetch(`${GRIEVANCES_SERVICE_URL}?${params.toString()}`);
    if (!res.ok) return { success: false, error: "Failed to fetch grievances" };
    
    const data = await res.json();
    return { success: true, data };
  } catch (error) {
    return { success: false, error: "Network error" };
  }
}

export async function createGrievance(payload: any) {
  const headers = await getHeaders();
  try {
    const res = await fetch(GRIEVANCES_SERVICE_URL, {
      method: "POST",
      headers,
      body: JSON.stringify(payload),
    });
    
    if (!res.ok) {
      const err = await res.json();
      return { success: false, error: err.message || "Failed to post grievance" };
    }
    
    revalidatePath("/worker/community");
    return { success: true };
  } catch (error) {
    return { success: false, error: "Network error" };
  }
}

export async function fetchPlatforms() {
  const headers = await getHeaders();
  try {
    const res = await fetch(`${EARNINGS_SERVICE_URL}/platforms`, { headers });
    if (!res.ok) return { success: false, error: "Failed to fetch platforms" };
    const data = await res.json();
    return { success: true, data };
  } catch (error) {
    return { success: false, error: "Network error" };
  }
}
