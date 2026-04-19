"use server";

const ANOMALY_SERVICE_URL = process.env.ANOMALY_SERVICE_URL || "http://localhost:4002";
const INTERNAL_API_KEY = process.env.INTERNAL_API_KEY || "";

export async function checkAnomaliesAction(workerId: string) {
  try {
    const response = await fetch(`${ANOMALY_SERVICE_URL}/api/anomaly/analyze`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "x-internal-api-key": INTERNAL_API_KEY,
      },
      body: JSON.stringify({ workerId }),
    });

    if (!response.ok) {
      const errorBody = await response.text();
      console.error("Anomaly service error:", response.status, errorBody);
      return { success: false, error: `Anomaly service returned ${response.status}. Is it running on port 4002?` };
    }

    const data = await response.json();
    return { success: true, data };
  } catch (error: any) {
    console.error("Anomaly detection failed:", error);
    // Give a helpful message when the service is simply not running
    if (error?.cause?.code === "ECONNREFUSED") {
      return {
        success: false,
        error: "Anomaly service is not running. Start it with: cd api/anomaly && python main.py",
      };
    }
    return { success: false, error: error.message || "Network error occurred." };
  }
}
