'use server'

import { cookies } from 'next/headers'
import { redirect } from 'next/navigation'


export async function loginAction(formData: FormData) {
  const email = formData.get('email')
  const password = formData.get('password')

  let isSuccess = false;
  let redirectPath = '/'; // Default fallback

  try {
    const response = await fetch(`${process.env.AUTH_SERVICE_URL}/login`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email, password }),
    })

    if (response.ok) {
      const result = await response.json()
      const { accessToken, user } = result.data 
      
      const cookieStore = await cookies()
      
      cookieStore.set('accessToken', accessToken, { 
        httpOnly: true, 
        secure: process.env.NODE_ENV === 'production',
        sameSite: 'lax',
        path: '/',
        maxAge: 60 * 60 * 24 
      })

      cookieStore.set('user', JSON.stringify(user), { 
        httpOnly: true, 
        secure: process.env.NODE_ENV === 'production',
        sameSite: 'lax',
        path: '/',
        maxAge: 60 * 60 * 24 
      })
      
      // Determine where to send the user based on their role
      const role = user.role.toUpperCase()
      
      if (role === 'WORKER') {
        redirectPath = '/worker'
      } else if (role === 'VERIFIER') {
        redirectPath = '/verifier'
      } else if (role === 'ADVOCATE') {
        redirectPath = '/advocate'
      }

      isSuccess = true;
    } else {
      const errorData = await response.json()
      return { error: errorData.message || "Invalid credentials." }
    }
  } catch (error) {
    console.error('Login request failed:', error)
    return { error: "Network error occurred." }
  }

  // Execute the redirect outside the try/catch block
  if (isSuccess) {
    redirect(redirectPath)
  }
}

export async function signupAction(prevState: any, formData: FormData) {
  const role = formData.get('role') as string
  const email = formData.get('email') as string
  const password = formData.get('password') as string
  const confirmPassword = formData.get('confirm-password') as string

  if (password !== confirmPassword) {
    return { error: "Passwords do not match" } 
  }

  let isSuccess = false;
  let endpoint = '';
  let payload: any = { email, password };

  // Determine endpoint and payload based on selected role
  if (role === 'WORKER') {
    endpoint = `${process.env.AUTH_SERVICE_URL}/register/worker`;
    payload = {
      ...payload,
      category: formData.get('category'),
      cityZone: formData.get('cityZone'),
      // Note: first_name and last_name aren't in your new Swagger screenshot,
      // but we'll pass them in case your backend still accepts/needs them.
      first_name: formData.get('first_name'),
      last_name: formData.get('last_name')
    };
  } else if (role === 'VERIFIER') {
    endpoint = `${process.env.AUTH_SERVICE_URL}/register/verifier`;
    // Verifier endpoint only takes email and password according to Swagger
  } else {
    return { error: "Invalid role selected." }
  }

  try {
    const response = await fetch(endpoint, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(payload),
    })

    if (response.ok) {
      isSuccess = true;
    } else {
       const errorData = await response.json()
       return { error: errorData.message || "Registration failed. Please try again." }
    }
  } catch (error) {
    console.error('Registration request failed:', error)
    return { error: "An unexpected error occurred." }
  }

  // Redirect to login page on success. 
  // Workers can log in immediately. Verifiers will be restricted by the backend until approved.
  if (isSuccess) {
    redirect('/')
  }
}

export async function logoutAction() {
  const cookieStore = await cookies()
  
  try {
    // 1. Forward the cookies to your backend so it can clear the refresh token
    const cookieHeader = cookieStore.getAll().map(c => `${c.name}=${c.value}`).join('; ');
    
    await fetch(`${process.env.AUTH_SERVICE_URL}/logout`, {
      method: 'POST',
      headers: {
        'Cookie': cookieHeader
      }
    })
  } catch (error) {
    console.error('Backend logout request failed:', error)
  }

  // 2. Clear the Next.js cookies
  cookieStore.delete('accessToken')
  cookieStore.delete('user')

  // 3. Redirect to login page
  redirect('/')
}