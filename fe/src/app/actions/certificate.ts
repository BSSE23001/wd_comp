"use server";

const CERTIFICATE_SERVICE_URL = process.env.CERTIFICATE_SERVICE_URL || "http://localhost:4003";

export async function generateCertificateAction(
  workerId: string,
  startDate: string,
  endDate: string
) {
  try {
    const url = new URL(`${CERTIFICATE_SERVICE_URL}/api/certificate/generate`);
    url.searchParams.append("workerId", workerId);
    url.searchParams.append("startDate", startDate);
    url.searchParams.append("endDate", endDate);

    const response = await fetch(url.toString(), {
      method: "GET",
      headers: {
        "Accept": "application/pdf",
      },
    });

    if (!response.ok) {
      const errorData = await response.text();
      console.error("Certificate API Error:", response.status, errorData);
      throw new Error(`Certificate service returned ${response.status}: ${errorData}`);
    }

    // Convert the PDF binary stream to base64 so it can cross the server→client boundary
    const arrayBuffer = await response.arrayBuffer();
    const buffer = Buffer.from(arrayBuffer);
    const base64Pdf = buffer.toString("base64");

    return { success: true, data: base64Pdf };
  } catch (error: any) {
    console.error("Certificate generation error:", error);
    return {
      success: false,
      error: error.message || "Failed to generate certificate.",
    };
  }
}
