"use client"

import { useState } from "react"
import { useForm } from "react-hook-form"
import { useGsapEntrance } from "@/lib/hooks/use-gsap-entrance"
import { zodResolver } from "@hookform/resolvers/zod"
import { z } from "zod"
import { format } from "date-fns"
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Badge } from "@/components/ui/badge"
import { Icon } from "@iconify/react"

interface UserProfile {
  id: string
  name: string
  email: string
  role: string
  status: string
  createdAt: Date
}

const profileSchema = z.object({
  name: z.string().min(1, "Name is required").max(100),
  email: z.string().email("Invalid email"),
})

const passwordSchema = z
  .object({
    currentPassword: z.string().min(1, "Current password is required"),
    newPassword: z.string().min(8, "At least 8 characters"),
    confirmPassword: z.string(),
  })
  .refine((d) => d.newPassword === d.confirmPassword, {
    message: "Passwords don't match",
    path: ["confirmPassword"],
  })

type ProfileForm = z.infer<typeof profileSchema>
type PasswordForm = z.infer<typeof passwordSchema>

export default function SettingsClient({ user }: { user: UserProfile }) {
  const containerRef = useGsapEntrance()
  const [profileSuccess, setProfileSuccess] = useState(false)
  const [profileError, setProfileError] = useState<string | null>(null)
  const [passwordSuccess, setPasswordSuccess] = useState(false)
  const [passwordError, setPasswordError] = useState<string | null>(null)

  const profileForm = useForm<ProfileForm>({
    resolver: zodResolver(profileSchema),
    defaultValues: { name: user.name, email: user.email },
  })

  const passwordForm = useForm<PasswordForm>({
    resolver: zodResolver(passwordSchema),
    defaultValues: { currentPassword: "", newPassword: "", confirmPassword: "" },
  })

  const handleProfileSubmit = async (data: ProfileForm) => {
    setProfileError(null)
    setProfileSuccess(false)
    try {
      const res = await fetch("/api/user/profile", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(data),
      })
      const json = await res.json()
      if (!res.ok) {
        setProfileError(json.error ?? "Failed to update profile")
        return
      }
      setProfileSuccess(true)
      setTimeout(() => setProfileSuccess(false), 3000)
    } catch {
      setProfileError("Something went wrong")
    }
  }

  const handlePasswordSubmit = async (data: PasswordForm) => {
    setPasswordError(null)
    setPasswordSuccess(false)
    try {
      const res = await fetch("/api/user/password", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          currentPassword: data.currentPassword,
          newPassword: data.newPassword,
        }),
      })
      const json = await res.json()
      if (!res.ok) {
        setPasswordError(json.error ?? "Failed to change password")
        return
      }
      setPasswordSuccess(true)
      passwordForm.reset()
      setTimeout(() => setPasswordSuccess(false), 3000)
    } catch {
      setPasswordError("Something went wrong")
    }
  }

  return (
    <div ref={containerRef} className="max-w-2xl space-y-6">

      {/* Account Info */}
      <Card className="gsap-enter">
        <CardHeader className="pb-3">
          <CardTitle className="text-base font-black font-sans flex items-center gap-2">
            <Icon icon="lucide:id-card" className="w-4 h-4" />
            Account Info
          </CardTitle>
          <CardDescription>Your account details and status.</CardDescription>
        </CardHeader>
        <CardContent className="space-y-3">
          <div className="flex items-center justify-between text-sm">
            <span className="text-muted-foreground">Member since</span>
            <span className="font-medium">{format(new Date(user.createdAt), "MMM d, yyyy")}</span>
          </div>
          <div className="flex items-center justify-between text-sm">
            <span className="text-muted-foreground">Role</span>
            <Badge variant={user.role === "ADMIN" ? "default" : "secondary"} className="capitalize text-xs">
              {user.role.toLowerCase()}
            </Badge>
          </div>
          <div className="flex items-center justify-between text-sm">
            <span className="text-muted-foreground">Status</span>
            <Badge
              variant="outline"
              className={`text-xs capitalize ${
                user.status === "ACTIVE"
                  ? "text-green-600 border-green-300 bg-green-50 dark:bg-green-950/30"
                  : user.status === "BANNED"
                  ? "text-red-600 border-red-300 bg-red-50"
                  : "text-yellow-600 border-yellow-300 bg-yellow-50"
              }`}
            >
              {user.status.toLowerCase()}
            </Badge>
          </div>
        </CardContent>
      </Card>

      {/* Profile */}
      <Card className="gsap-enter">
        <CardHeader className="pb-3">
          <CardTitle className="text-base font-black font-sans flex items-center gap-2">
            <Icon icon="lucide:user" className="w-4 h-4" />
            Profile
          </CardTitle>
          <CardDescription>Update your display name and email address.</CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={profileForm.handleSubmit(handleProfileSubmit)} className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="name">Name</Label>
              <Input id="name" {...profileForm.register("name")} />
              {profileForm.formState.errors.name && (
                <p className="text-xs text-destructive">{profileForm.formState.errors.name.message}</p>
              )}
            </div>
            <div className="space-y-2">
              <Label htmlFor="email">Email</Label>
              <Input id="email" type="email" {...profileForm.register("email")} />
              {profileForm.formState.errors.email && (
                <p className="text-xs text-destructive">{profileForm.formState.errors.email.message}</p>
              )}
            </div>
            {profileError && (
              <p className="text-xs text-destructive flex items-center gap-1">
                <Icon icon="lucide:alert-circle" className="w-3.5 h-3.5" />
                {profileError}
              </p>
            )}
            {profileSuccess && (
              <p className="text-xs text-green-600 flex items-center gap-1">
                <Icon icon="lucide:check-circle" className="w-3.5 h-3.5" />
                Profile updated successfully.
              </p>
            )}
            <Button
              type="submit"
              size="sm"
              disabled={profileForm.formState.isSubmitting}
              className="gap-2"
            >
              {profileForm.formState.isSubmitting && (
                <Icon icon="lucide:loader-2" className="w-3.5 h-3.5 animate-spin" />
              )}
              Save changes
            </Button>
          </form>
        </CardContent>
      </Card>

      {/* Change Password */}
      <Card className="gsap-enter">
        <CardHeader className="pb-3">
          <CardTitle className="text-base font-black font-sans flex items-center gap-2">
            <Icon icon="lucide:lock" className="w-4 h-4" />
            Change Password
          </CardTitle>
          <CardDescription>Choose a strong password at least 8 characters long.</CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={passwordForm.handleSubmit(handlePasswordSubmit)} className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="currentPassword">Current password</Label>
              <Input id="currentPassword" type="password" {...passwordForm.register("currentPassword")} />
              {passwordForm.formState.errors.currentPassword && (
                <p className="text-xs text-destructive">{passwordForm.formState.errors.currentPassword.message}</p>
              )}
            </div>
            <div className="space-y-2">
              <Label htmlFor="newPassword">New password</Label>
              <Input id="newPassword" type="password" {...passwordForm.register("newPassword")} />
              {passwordForm.formState.errors.newPassword && (
                <p className="text-xs text-destructive">{passwordForm.formState.errors.newPassword.message}</p>
              )}
            </div>
            <div className="space-y-2">
              <Label htmlFor="confirmPassword">Confirm new password</Label>
              <Input id="confirmPassword" type="password" {...passwordForm.register("confirmPassword")} />
              {passwordForm.formState.errors.confirmPassword && (
                <p className="text-xs text-destructive">{passwordForm.formState.errors.confirmPassword.message}</p>
              )}
            </div>
            {passwordError && (
              <p className="text-xs text-destructive flex items-center gap-1">
                <Icon icon="lucide:alert-circle" className="w-3.5 h-3.5" />
                {passwordError}
              </p>
            )}
            {passwordSuccess && (
              <p className="text-xs text-green-600 flex items-center gap-1">
                <Icon icon="lucide:check-circle" className="w-3.5 h-3.5" />
                Password changed successfully.
              </p>
            )}
            <Button
              type="submit"
              size="sm"
              disabled={passwordForm.formState.isSubmitting}
              className="gap-2"
            >
              {passwordForm.formState.isSubmitting && (
                <Icon icon="lucide:loader-2" className="w-3.5 h-3.5 animate-spin" />
              )}
              Change password
            </Button>
          </form>
        </CardContent>
      </Card>

    </div>
  )
}
