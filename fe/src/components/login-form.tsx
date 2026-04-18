// components/login-form.tsx
import { loginAction } from "@/app/actions/auth"

export function LoginForm() {
  return (
    // Pass the server action directly to the form's action attribute
    <form action={loginAction} className="flex flex-col gap-4">
      <div className="space-y-2">
        <label htmlFor="email" className="text-sm font-medium">Email</label>
        <input 
          id="email"
          type="email" 
          name="email" 
          required 
          className="flex h-10 w-full rounded-md border px-3 py-2"
        />
      </div>

      <div className="space-y-2">
        <label htmlFor="password" className="text-sm font-medium">Password</label>
        <input 
          id="password"
          type="password" 
          name="password" 
          required 
          className="flex h-10 w-full rounded-md border px-3 py-2"
        />
      </div>

      <button 
        type="submit" 
        className="inline-flex h-10 items-center justify-center rounded-md bg-primary px-4 py-2 text-primary-foreground"
      >
        Sign IN
      </button>
    </form>
  )
}