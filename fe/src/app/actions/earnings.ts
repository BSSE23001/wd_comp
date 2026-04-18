// app/actions/earnings.ts
'use server'

import { cookies } from 'next/headers'
import { revalidatePath } from 'next/cache'

export async function logShiftAction(prevState: any, formData: FormData) {
  const cookieStore = await cookies()
  const token = cookieStore.get('accessToken')?.value

  if (!token) return { error: "You must be logged in to log a shift." }

  // --- DEBUG LOGS: Check your Terminal for these! ---
  // console.log("--- New Shift Submission Received ---");
  // for (const [key, value] of formData.entries()) {
  //   if (key === 'screenshot') {
  //     console.log(`Field: ${key} | File Name: ${(value as File).name}`);
  //   } else {
  //     console.log(`Field: ${key} | Value: ${value}`);
  //   }
  // }

  try {
    const baseUrl = process.env.EARNINGS_API_URL;
    const internalApiKey = process.env.INTERNAL_API_KEY;
    
    if (!baseUrl || !internalApiKey) return { error: "Server configuration error." };

    const response = await fetch(`${baseUrl}/earnings/logs`, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${token}`, 
        'x-internal-api-key': internalApiKey,
        // Passing cookies to keep session consistent
        'Cookie': cookieStore.getAll().map(c => `${c.name}=${c.value}`).join('; ')
      },
      body: formData, // Browser automatically formats this as multipart/form-data
    })

    const result = await response.json();
    
    // LOG THE MICROSERVICE RESPONSE
    console.log(">>> Microservice Response:", result);

    if (response.ok) {
      revalidatePath('/worker')
      return { success: true, data: result }
    } else {
      // Return the detailed error message from your new controller
      return { error: result.message || "Failed to submit earnings log." }
    }
  } catch (error: any) {
    console.error('Earnings log request failed:', error)
    return { error: "An unexpected error occurred." }
  }
}

export async function getPlatformsAction() {
  const cookieStore = await cookies();
  const token = cookieStore.get('accessToken')?.value;

  try {
    const baseUrl = process.env.EARNINGS_API_URL;
    const internalApiKey = process.env.INTERNAL_API_KEY;
    
    if (!baseUrl || !internalApiKey) return [];

    const response = await fetch(`${baseUrl}/earnings/platforms`, {
      method: 'GET',
      headers: {
        'x-internal-api-key': internalApiKey,
        'Authorization': `Bearer ${token}`, 
        'Content-Type': 'application/json',
      },
      cache: 'no-store' 
    });

    const data = await response.json();
    
    // LOG THE PLATFORMS ARRAY
    console.log(">>> Platforms fetched for dropdown:", data);

    return Array.isArray(data) ? data : (data.data || []);
  } catch (error) {
    console.error('Failed to fetch platforms:', error);
    return [];
  }
}

export async function getEarningsLogsAction(page = 1, limit = 10) {
  const cookieStore = await cookies();
  const token = cookieStore.get('accessToken')?.value;

  try {
    const baseUrl = process.env.EARNINGS_API_URL;
    const internalApiKey = process.env.INTERNAL_API_KEY;
    
    if (!baseUrl || !internalApiKey) return { data: [], total: 0 };

    const response = await fetch(`${baseUrl}/earnings/logs?page=${page}&limit=${limit}`, {
      method: 'GET',
      headers: {
        'x-internal-api-key': internalApiKey,
        'Authorization': `Bearer ${token}`,
      },
      next: { revalidate: 0 } // Ensure fresh data on every visit
    });

    if (!response.ok) {
      console.error(`API Error: ${response.status} ${response.statusText}`);
      return { data: [], total: 0 };
    }

    const result = await response.json(); 

    // SERVER LOG: View this in your terminal
    console.log(">>> WORKER_LOGS_API_RESULT:", JSON.stringify(result, null, 2));

    return result; 
  } catch (error) {
    console.error('Failed to fetch logs:', error);
    return { data: [], total: 0 };
  }
}
export async function getVerifierQueueAction() {
  const cookieStore = await cookies();
  const token = cookieStore.get('accessToken')?.value;

  try {
    const baseUrl = process.env.EARNINGS_API_URL;
    const internalApiKey = process.env.INTERNAL_API_KEY;
    
    if (!baseUrl || !internalApiKey) return [];

    const response = await fetch(`${baseUrl}/earnings/verifier/queue`, {
      method: 'GET',
      headers: {
        'x-internal-api-key': internalApiKey,
        'Authorization': `Bearer ${token}`,
      },
      cache: 'no-store' // Verifiers need the most up-to-date queue
    });

    if (!response.ok) return [];
    return await response.json(); 
  } catch (error) {
    console.error('Failed to fetch verifier queue:', error);
    return [];
  }
}

export async function verifyLogAction(logId: string, status: string, notes: string) {
  const cookieStore = await cookies();
  const token = cookieStore.get('accessToken')?.value;

  try {
    const baseUrl = process.env.EARNINGS_API_URL;
    const internalApiKey = process.env.INTERNAL_API_KEY;

    if (!baseUrl || !internalApiKey) return { error: "Server configuration error." };

    const response = await fetch(`${baseUrl}/earnings/verifier/logs/${logId}`, {
      method: 'PATCH',
      headers: {
        'Content-Type': 'application/json',
        'x-internal-api-key': internalApiKey,
        'Authorization': `Bearer ${token}`,
      },
      body: JSON.stringify({
        status,
        verifierNotes: notes
      }),
    });

    const result = await response.json();
    console.log(">>> VERIFICATION_UPDATE_RESULT:", result);

    if (response.ok) {
      // Refresh the verifier queue and the worker's dashboard
      revalidatePath('/verifier');
      revalidatePath('/worker');
      return { success: true };
    } else {
      return { error: result.message || "Failed to update log status." };
    }
  } catch (error) {
    console.error('Verification update failed:', error);
    return { error: "An unexpected error occurred." };
  }
}