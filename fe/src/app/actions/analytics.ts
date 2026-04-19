"use server";

import { cookies } from "next/headers";

const BASE_URL = "http://localhost:4005/api/analytics";

export async function fetchAdvocateAnalytics() {
  const cookieStore = await cookies();
  const token = cookieStore.get("accessToken")?.value;

  if (!token) {
    return { success: false, error: "Unauthorized" };
  }

  const headers = {
    Authorization: `Bearer ${token}`,
    "Content-Type": "application/json",
  };

  try {
    const [commissionsRes, distributionsRes, vulnerabilitiesRes] = await Promise.all([
      fetch(`${BASE_URL}/advocate/commissions`, { headers }),
      fetch(`${BASE_URL}/advocate/distributions`, { headers }),
      fetch(`${BASE_URL}/advocate/vulnerabilities`, { headers }),
    ]);

    if (!commissionsRes.ok || !distributionsRes.ok || !vulnerabilitiesRes.ok) {
      return { success: false, error: "Failed to fetch analytics data" };
    }

    const commissions = await commissionsRes.json();
    const distributions = await distributionsRes.json();
    const vulnerabilities = await vulnerabilitiesRes.json();

    return {
      success: true,
      data: { commissions, distributions, vulnerabilities },
    };
  } catch (error) {
    console.error("Analytics fetch error:", error);
    return { success: false, error: "Failed to fetch analytics" };
  }
}
