// app/actions/auth.ts
'use server'

import { cookies } from 'next/headers'
import { redirect } from 'next/navigation'

export async function loginAction(formData: FormData) {
  const email = formData.get('email')
  const password = formData.get('password')

  let isSuccess = false;

  try {
    const response = await fetch('http://localhost:5000/api/auth/login', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ email, password }),
    })

    if (response.ok) {
      const data = await response.json()
      
      // FIX: Await the cookies() promise before setting the cookie
      const cookieStore = await cookies()
      
      cookieStore.set('accessToken', data.accessToken, { 
        httpOnly: true, 
        secure: process.env.NODE_ENV === 'production',
        sameSite: 'lax',
        path: '/',
        maxAge: 60 * 60 * 24 
      })
      
      isSuccess = true;
    }
  } catch (error) {
    console.error('Login request failed:', error)
  }

  if (isSuccess) {
    redirect('/home')
  } else {
    redirect('/')
  }
}



export async function signupAction(prevState: any, formData: FormData) {
  // Grab the separated name fields
  const first_name = formData.get('first_name') as string
  const last_name = formData.get('last_name') as string
  const email = formData.get('email') as string
  const password = formData.get('password') as string
  const confirmPassword = formData.get('confirm-password') as string

  if (password !== confirmPassword) {
    return { error: "Passwords do not match" } 
  }

  let isSuccess = false;

  try {
    const response = await fetch('http://localhost:5000/api/auth/signup', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        email,
        password,
        first_name, // Send directly to the API
        last_name,  // Send directly to the API
        role: "WORKER" 
      }),
    })

    if (response.ok) {
      isSuccess = true;
    } else {
       const errorData = await response.json()
       return { error: errorData.message || "Signup failed. Please try again." }
    }
  } catch (error) {
    console.error('Signup request failed:', error)
    return { error: "An unexpected error occurred." }
  }

  if (isSuccess) {
    redirect('/')
  }
}