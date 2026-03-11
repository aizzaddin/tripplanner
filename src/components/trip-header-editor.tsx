"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"
import { format } from "date-fns"
import type { DateRange } from "react-day-picker"
import { CURRENCIES } from "@/lib/constants"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Calendar } from "@/components/ui/calendar"
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import { Icon } from "@iconify/react"
import { cn } from "@/lib/utils"

interface TripHeaderEditorProps {
  tripId: string
  name: string
  currency: string
  startDate: string
  endDate: string
}

export default function TripHeaderEditor({
  tripId,
  name,
  currency,
  startDate,
  endDate,
}: TripHeaderEditorProps) {
  const router = useRouter()
  const [open, setOpen] = useState(false)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const [editName, setEditName] = useState(name)
  const [editCurrency, setEditCurrency] = useState(currency)
  const [dateRange, setDateRange] = useState<DateRange | undefined>({
    from: new Date(startDate),
    to: new Date(endDate),
  })
  const [showCalendar, setShowCalendar] = useState(false)

  const openDialog = () => {
    setEditName(name)
    setEditCurrency(currency)
    setDateRange({ from: new Date(startDate), to: new Date(endDate) })
    setShowCalendar(false)
    setError(null)
    setOpen(true)
  }

  const handleRangeSelect = (range: DateRange | undefined) => {
    setDateRange(range)
    const hasValidRange =
      range?.from && range?.to && range.to.getTime() !== range.from.getTime()
    if (hasValidRange) setShowCalendar(false)
  }

  const hasValidRange =
    dateRange?.from && dateRange?.to && dateRange.to.getTime() !== dateRange.from.getTime()

  const dateLabel = dateRange?.from
    ? hasValidRange
      ? `${format(dateRange.from, "MMM d")} – ${format(dateRange.to!, "MMM d, yyyy")}`
      : `${format(dateRange.from, "MMM d, yyyy")} – pick end date`
    : "Select dates"

  const handleSave = async () => {
    if (!editName.trim()) { setError("Trip name is required"); return }
    if (!hasValidRange) { setError("Please select a valid date range"); return }

    setLoading(true)
    setError(null)
    try {
      const res = await fetch(`/api/trips/${tripId}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          name: editName.trim(),
          currency: editCurrency,
          startDate: format(dateRange!.from!, "yyyy-MM-dd"),
          endDate: format(dateRange!.to!, "yyyy-MM-dd"),
        }),
      })
      if (!res.ok) {
        const json = await res.json()
        setError(json.error || "Failed to update trip")
        return
      }
      setOpen(false)
      router.refresh()
    } finally {
      setLoading(false)
    }
  }

  return (
    <>
      <button
        onClick={openDialog}
        className="text-muted-foreground hover:text-foreground transition-colors"
        title="Edit trip details"
      >
        <Icon icon="lucide:pencil" className="w-4 h-4" />
      </button>

      <Dialog open={open} onOpenChange={setOpen}>
        <DialogContent className="sm:max-w-lg max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>Edit Trip Details</DialogTitle>
          </DialogHeader>

          <div className="space-y-4 pt-1">
            {error && (
              <div className="bg-destructive/10 text-destructive text-sm rounded-md p-3">
                {error}
              </div>
            )}

            {/* Name */}
            <div className="space-y-2">
              <Label>Trip Name</Label>
              <Input
                value={editName}
                onChange={(e) => setEditName(e.target.value)}
                placeholder="e.g. Bali Summer 2025"
              />
            </div>

            {/* Currency */}
            <div className="space-y-2">
              <Label>Currency</Label>
              <Select value={editCurrency} onValueChange={setEditCurrency}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {CURRENCIES.map((c) => (
                    <SelectItem key={c} value={c}>{c}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            {/* Date Range */}
            <div className="space-y-2">
              <Label>Travel Dates</Label>
              <button
                type="button"
                onClick={() => setShowCalendar((v) => !v)}
                className={cn(
                  "w-full flex items-center gap-2 px-3 py-2 rounded-md border border-input bg-background text-sm text-left transition-colors hover:border-ring",
                  !hasValidRange && "text-muted-foreground"
                )}
              >
                <Icon icon="lucide:calendar" className="w-4 h-4 shrink-0 text-muted-foreground" />
                <span>{dateLabel}</span>
                {hasValidRange && (
                  <span
                    role="button"
                    tabIndex={0}
                    onClick={(e) => { e.stopPropagation(); setDateRange(undefined) }}
                    onKeyDown={(e) => e.key === "Enter" && setDateRange(undefined)}
                    className="ml-auto text-muted-foreground hover:text-foreground"
                  >
                    <Icon icon="lucide:x" className="w-3.5 h-3.5" />
                  </span>
                )}
              </button>

              {showCalendar && (
                <div className="border rounded-md p-3 animate-slide-down">
                  <Calendar
                    mode="range"
                    selected={dateRange}
                    onSelect={handleRangeSelect}
                    numberOfMonths={2}
                    defaultMonth={dateRange?.from}
                  />
                </div>
              )}
            </div>

            {/* Actions */}
            <div className="flex gap-2 pt-2">
              <Button onClick={handleSave} disabled={loading} className="flex-1">
                {loading ? (
                  <Icon icon="lucide:loader-2" className="w-4 h-4 animate-spin mr-2" />
                ) : null}
                Save Changes
              </Button>
              <Button variant="outline" onClick={() => setOpen(false)} disabled={loading}>
                Cancel
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </>
  )
}
