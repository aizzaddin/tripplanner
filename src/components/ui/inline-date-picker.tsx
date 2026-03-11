"use client"

import { useState } from "react"
import { format, parse, isValid } from "date-fns"
import { Icon } from "@iconify/react"
import { Calendar } from "@/components/ui/calendar"
import { cn } from "@/lib/utils"

interface InlineDatePickerProps {
  value: string // "yyyy-MM-dd" or ""
  onChange: (value: string) => void
  placeholder?: string
  className?: string
}

export function InlineDatePicker({
  value,
  onChange,
  placeholder = "Pick a date",
  className,
}: InlineDatePickerProps) {
  const [open, setOpen] = useState(false)

  const selected = value
    ? parse(value, "yyyy-MM-dd", new Date())
    : undefined

  const displayDate =
    selected && isValid(selected)
      ? format(selected, "MMM d, yyyy")
      : null

  return (
    <div className={cn("space-y-1", className)}>
      <button
        type="button"
        onClick={() => setOpen((v) => !v)}
        className={cn(
          "w-full flex items-center gap-2 rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background transition-colors hover:bg-accent hover:text-accent-foreground text-left",
          !displayDate && "text-muted-foreground"
        )}
      >
        <Icon icon="lucide:calendar" className="w-4 h-4 shrink-0" />
        <span className="flex-1">{displayDate ?? placeholder}</span>
        {value && (
          <span
            role="button"
            tabIndex={0}
            onClick={(e) => {
              e.stopPropagation()
              onChange("")
              setOpen(false)
            }}
            onKeyDown={(e) => {
              if (e.key === "Enter" || e.key === " ") {
                e.stopPropagation()
                onChange("")
                setOpen(false)
              }
            }}
            className="p-0.5 rounded hover:bg-muted text-muted-foreground cursor-pointer"
          >
            <Icon icon="lucide:x" className="w-3 h-3" />
          </span>
        )}
        <Icon
          icon={open ? "lucide:chevron-up" : "lucide:chevron-down"}
          className="w-4 h-4 shrink-0 opacity-50"
        />
      </button>

      {open && (
        <div className="rounded-md border bg-background shadow-sm flex justify-center p-2 animate-slide-down">
          <Calendar
            mode="single"
            selected={selected && isValid(selected) ? selected : undefined}
            onSelect={(date) => {
              if (date) {
                onChange(format(date, "yyyy-MM-dd"))
                setOpen(false)
              }
            }}
            initialFocus={false}
          />
        </div>
      )}
    </div>
  )
}
