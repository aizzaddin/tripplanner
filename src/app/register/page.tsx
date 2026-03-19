"use client"

import { useState } from "react"
import { useForm } from "react-hook-form"
import { zodResolver } from "@hookform/resolvers/zod"
import { signIn } from "next-auth/react"
import { useRouter } from "next/navigation"
import Link from "next/link"
import { registerSchema, passwordRules, type RegisterInput } from "@/lib/validations/auth"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Icon } from "@iconify/react"

export default function RegisterPage() {
  const [error, setError] = useState<string | null>(null)
  const [loading, setLoading] = useState(false)
  const [showPassword, setShowPassword] = useState(false)
  const [showConfirm, setShowConfirm] = useState(false)
  const router = useRouter()

  const {
    register,
    handleSubmit,
    watch,
    formState: { errors },
  } = useForm<RegisterInput>({
    resolver: zodResolver(registerSchema),
  })

  const passwordValue = watch("password") ?? ""
  const passedRules = passwordRules.filter((r) => r.test(passwordValue))
  const strength = passedRules.length

  const strengthLabel = ["", "Weak", "Weak", "Fair", "Good", "Strong"][strength]
  const strengthColor = ["", "bg-red-500", "bg-red-400", "bg-yellow-400", "bg-blue-500", "bg-green-500"][strength]

  const onSubmit = async (data: RegisterInput) => {
    setLoading(true)
    setError(null)
    try {
      const res = await fetch("/api/auth/register", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(data),
      })
      const json = await res.json()
      if (!res.ok) {
        setError(json.error || "Registration failed")
        return
      }
      const result = await signIn("credentials", {
        email: data.email,
        password: data.password,
        redirect: false,
      })
      if (result?.error) {
        setError("Account created but sign in failed. Please try logging in.")
        router.push("/login")
      } else {
        router.push("/dashboard")
      }
    } catch {
      setError("Something went wrong. Please try again.")
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-background px-4">
      <div className="w-full max-w-md">
        <div className="text-center mb-8">
          <h1 className="text-3xl font-bold tracking-tight">Trip Planner</h1>
          <p className="text-muted-foreground mt-2">Start planning your adventures</p>
        </div>

        <Card>
          <CardHeader>
            <CardTitle>Create an account</CardTitle>
            <CardDescription>Enter your details to get started</CardDescription>
          </CardHeader>

          <form onSubmit={handleSubmit(onSubmit)}>
            <CardContent className="space-y-4">
              {error && (
                <div className="bg-destructive/10 text-destructive text-sm rounded-md p-3">
                  {error}
                </div>
              )}

              {/* Name */}
              <div className="space-y-2">
                <Label htmlFor="name">Name</Label>
                <Input id="name" type="text" placeholder="Your name" {...register("name")} />
                {errors.name && <p className="text-destructive text-sm">{errors.name.message}</p>}
              </div>

              {/* Email */}
              <div className="space-y-2">
                <Label htmlFor="email">Email</Label>
                <div className="relative">
                  <Input
                    id="email"
                    type="email"
                    placeholder="you@example.com"
                    className="pr-10"
                    {...register("email")}
                  />
                  {watch("email") && (
                    <span className="absolute right-3 top-1/2 -translate-y-1/2">
                      {/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(watch("email")) ? (
                        <Icon icon="lucide:check-circle" className="w-4 h-4 text-green-500" />
                      ) : (
                        <Icon icon="lucide:alert-circle" className="w-4 h-4 text-destructive" />
                      )}
                    </span>
                  )}
                </div>
                {errors.email && <p className="text-destructive text-sm">{errors.email.message}</p>}
              </div>

              {/* Password */}
              <div className="space-y-2">
                <Label htmlFor="password">Password</Label>
                <div className="relative">
                  <Input
                    id="password"
                    type={showPassword ? "text" : "password"}
                    placeholder="Create a strong password"
                    className="pr-10"
                    {...register("password")}
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword((v) => !v)}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground"
                    tabIndex={-1}
                  >
                    <Icon icon={showPassword ? "lucide:eye-off" : "lucide:eye"} className="w-4 h-4" />
                  </button>
                </div>
                {errors.password && <p className="text-destructive text-sm">{errors.password.message}</p>}

                {/* Strength bar */}
                {passwordValue.length > 0 && (
                  <div className="space-y-2">
                    <div className="flex gap-1">
                      {[1, 2, 3, 4, 5].map((i) => (
                        <div
                          key={i}
                          className={`h-1 flex-1 rounded-full transition-all duration-300 ${
                            i <= strength ? strengthColor : "bg-muted"
                          }`}
                        />
                      ))}
                    </div>
                    {strengthLabel && (
                      <p className={`text-xs font-medium ${
                        strength <= 2 ? "text-red-500" : strength === 3 ? "text-yellow-500" : strength === 4 ? "text-blue-500" : "text-green-600"
                      }`}>
                        {strengthLabel}
                      </p>
                    )}

                    {/* Requirements checklist */}
                    <ul className="space-y-1">
                      {passwordRules.map((rule) => {
                        const passed = rule.test(passwordValue)
                        return (
                          <li key={rule.id} className={`flex items-center gap-1.5 text-xs ${passed ? "text-green-600" : "text-muted-foreground"}`}>
                            <Icon
                              icon={passed ? "lucide:check-circle" : "lucide:circle"}
                              className="w-3.5 h-3.5 shrink-0"
                            />
                            {rule.label}
                          </li>
                        )
                      })}
                    </ul>
                  </div>
                )}
              </div>

              {/* Confirm Password */}
              <div className="space-y-2">
                <Label htmlFor="confirmPassword">Confirm Password</Label>
                <div className="relative">
                  <Input
                    id="confirmPassword"
                    type={showConfirm ? "text" : "password"}
                    placeholder="Re-enter your password"
                    className="pr-10"
                    {...register("confirmPassword")}
                  />
                  <button
                    type="button"
                    onClick={() => setShowConfirm((v) => !v)}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground"
                    tabIndex={-1}
                  >
                    <Icon icon={showConfirm ? "lucide:eye-off" : "lucide:eye"} className="w-4 h-4" />
                  </button>
                </div>
                {errors.confirmPassword && (
                  <p className="text-destructive text-sm">{errors.confirmPassword.message}</p>
                )}
              </div>
            </CardContent>

            <CardFooter className="flex flex-col gap-4">
              <Button type="submit" className="w-full" disabled={loading}>
                {loading ? "Creating account..." : "Create account"}
              </Button>
              <p className="text-sm text-muted-foreground text-center">
                Already have an account?{" "}
                <Link href="/login" className="text-primary font-medium hover:underline">
                  Sign in
                </Link>
              </p>
            </CardFooter>
          </form>
        </Card>
      </div>
    </div>
  )
}
