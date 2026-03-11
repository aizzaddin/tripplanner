"use client"

import { useState } from "react"
import { useForm } from "react-hook-form"
import { zodResolver } from "@hookform/resolvers/zod"
import { createMemberSchema } from "@/lib/validations/member"
import { MEMBER_COLORS } from "@/lib/constants"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import { cn } from "@/lib/utils"

type MemberCategory = "ADULT" | "CHILD" | "BABY"

type FormValues = {
  name: string
  category: MemberCategory
  color: string
}

interface MemberFormProps {
  tripId: string
  onSuccess?: () => void
}

export default function MemberForm({ tripId, onSuccess }: MemberFormProps) {
  const [error, setError] = useState<string | null>(null)
  const [loading, setLoading] = useState(false)

  const {
    register,
    handleSubmit,
    setValue,
    watch,
    formState: { errors },
  } = useForm<FormValues>({
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    resolver: zodResolver(createMemberSchema) as any,
    defaultValues: {
      category: "ADULT",
      color: MEMBER_COLORS[0],
    },
  })

  const selectedColor = watch("color")
  const category = watch("category")

  const onSubmit = async (data: FormValues) => {
    setLoading(true)
    setError(null)

    try {
      const res = await fetch(`/api/trips/${tripId}/members`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(data),
      })

      const json = await res.json()

      if (!res.ok) {
        setError(json.error || "Failed to add member")
        return
      }

      onSuccess?.()
    } catch {
      setError("Something went wrong. Please try again.")
    } finally {
      setLoading(false)
    }
  }

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
      {error && (
        <div className="bg-destructive/10 text-destructive text-sm rounded-md p-3">
          {error}
        </div>
      )}

      <div className="space-y-2">
        <Label htmlFor="member-name">Name</Label>
        <Input
          id="member-name"
          placeholder="Member name"
          {...register("name")}
        />
        {errors.name && (
          <p className="text-destructive text-sm">{errors.name.message}</p>
        )}
      </div>

      <div className="space-y-2">
        <Label>Category</Label>
        <Select value={category} onValueChange={(val) => setValue("category", val as MemberCategory)}>
          <SelectTrigger>
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="ADULT">Adult</SelectItem>
            <SelectItem value="CHILD">Child</SelectItem>
            <SelectItem value="BABY">Baby</SelectItem>
          </SelectContent>
        </Select>
      </div>

      <div className="space-y-2">
        <Label>Color</Label>
        <div className="flex gap-2 flex-wrap">
          {MEMBER_COLORS.map((color) => (
            <button
              key={color}
              type="button"
              onClick={() => setValue("color", color)}
              className={cn(
                "w-8 h-8 rounded-full border-2 transition-all",
                selectedColor === color ? "border-foreground scale-110" : "border-transparent"
              )}
              style={{ backgroundColor: color }}
            />
          ))}
        </div>
      </div>

      <Button type="submit" className="w-full" disabled={loading}>
        {loading ? "Adding..." : "Add Member"}
      </Button>
    </form>
  )
}
