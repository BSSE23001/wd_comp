// components/signup-form.tsx
'use client' 

import { useActionState, useState } from "react"
import { signupAction } from "@/app/actions/auth"
import { Button } from "@/components/ui/button"
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card"
import {
  Field,
  FieldDescription,
  FieldGroup,
  FieldLabel,
} from "@/components/ui/field"
import { Input } from "@/components/ui/input"

const initialState = {
  error: undefined,
}

export function SignupForm({ ...props }: React.ComponentProps<typeof Card>) {
  const [state, formAction, isPending] = useActionState(signupAction, initialState)
  
  // Track the selected role to conditionally render form fields
  const [selectedRole, setSelectedRole] = useState("WORKER")

  return (
    <Card {...props}>
      <CardHeader>
        <CardTitle>Create an account</CardTitle>
        <CardDescription>
          Enter your information below to create your account
        </CardDescription>
      </CardHeader>
      <CardContent>
        <form action={formAction}>
          <FieldGroup>
            
            {/* Role Selection */}
            <Field>
              <FieldLabel htmlFor="role">Register As</FieldLabel>
              <select 
                id="role" 
                name="role" 
                value={selectedRole}
                onChange={(e) => setSelectedRole(e.target.value)}
                className="flex h-10 w-full items-center justify-between rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
              >
                <option value="WORKER">Worker</option>
                <option value="VERIFIER">Verifier</option>
              </select>
            </Field>

            <div className="grid grid-cols-2 gap-4">
              <Field>
                <FieldLabel htmlFor="first-name">First Name</FieldLabel>
                <Input id="first-name" name="first_name" type="text" placeholder="John" required />
              </Field>
              <Field>
                <FieldLabel htmlFor="last-name">Last Name</FieldLabel>
                <Input id="last-name" name="last_name" type="text" placeholder="Doe" required />
              </Field>
            </div>
            
            <Field>
              <FieldLabel htmlFor="email">Email</FieldLabel>
              <Input
                id="email"
                name="email"
                type="email"
                placeholder="m@example.com"
                required
              />
            </Field>

            {/* Conditionally render Worker-specific fields */}
            {selectedRole === "WORKER" && (
              <div className="grid grid-cols-2 gap-4 border-y py-4 my-2">
                <Field>
                  <FieldLabel htmlFor="category">Work Category</FieldLabel>
                  <select 
                    id="category" 
                    name="category" 
                    className="flex h-10 w-full items-center justify-between rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2"
                  >
                    <option value="RIDE_HAILING">Ride Hailing</option>
                    <option value="FOOD_DELIVERY">Food Delivery</option>
                    <option value="FREELANCE">Freelance</option>
                  </select>
                </Field>

                <Field>
                  <FieldLabel htmlFor="cityZone">City Zone</FieldLabel>
                  <Input id="cityZone" name="cityZone" type="text" placeholder="e.g., Downtown" required={selectedRole === "WORKER"} />
                </Field>
              </div>
            )}

            <Field>
              <FieldLabel htmlFor="password">Password</FieldLabel>
              <Input id="password" name="password" type="password" required />
              <FieldDescription>
                Must be at least 8 characters long.
              </FieldDescription>
            </Field>

            <Field>
              <FieldLabel htmlFor="confirm-password">
                Confirm Password
              </FieldLabel>
              <Input id="confirm-password" name="confirm-password" type="password" required />
            </Field>

            {state?.error && (
              <div className="text-sm font-medium text-destructive text-red-500">
                {state.error}
              </div>
            )}

            <FieldGroup>
              <Field>
                <Button type="submit" disabled={isPending}>
                  {isPending ? "Creating..." : "Create Account"}
                </Button>
                <FieldDescription className="px-6 text-center mt-4">
                  Already have an account? <a href="/" className="underline">Sign in</a>
                </FieldDescription>
              </Field>
            </FieldGroup>
          </FieldGroup>
        </form>
      </CardContent>
    </Card>
  )
}