"use client"

import { useState } from "react"
import { format, addDays } from "date-fns"
import { useGsapEntrance } from "@/lib/hooks/use-gsap-entrance"
import { Icon } from "@iconify/react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"

interface Activity {
  order: number
  name: string
  estimatedTime?: string
}

interface ItineraryTodo {
  order: number
  name: string
  assignedTo?: string
}

interface ItineraryDay {
  id: string
  dayNumber: number
  mainArea: string | null
  accommodation: string | null
  activities: Activity[]
  todos: ItineraryTodo[]
  notes: string[]
}

interface ItineraryViewProps {
  tripId: string
  startDate: string
  initialDays: ItineraryDay[]
}

export default function ItineraryView({ tripId, startDate, initialDays }: ItineraryViewProps) {
  const containerRef = useGsapEntrance()
  const [days, setDays] = useState(initialDays)
  const [saving, setSaving] = useState<number | null>(null)
  const [editingDays, setEditingDays] = useState<Set<number>>(new Set())

  const [editState, setEditState] = useState<Record<number, {
    mainArea: string
    accommodation: string
    activities: Activity[]
    todos: ItineraryTodo[]
    notes: string[]
  }>>({})

  const isEditing = (dayNumber: number) => editingDays.has(dayNumber)

  const getEditState = (day: ItineraryDay) => {
    return editState[day.dayNumber] ?? {
      mainArea: day.mainArea ?? "",
      accommodation: day.accommodation ?? "",
      activities: day.activities,
      todos: day.todos,
      notes: day.notes,
    }
  }

  const startEditing = (day: ItineraryDay) => {
    setEditState((prev) => ({
      ...prev,
      [day.dayNumber]: {
        mainArea: day.mainArea ?? "",
        accommodation: day.accommodation ?? "",
        activities: [...day.activities],
        todos: [...day.todos],
        notes: [...day.notes],
      },
    }))
    setEditingDays((prev) => new Set(prev).add(day.dayNumber))
  }

  const cancelEditing = (dayNumber: number) => {
    setEditingDays((prev) => {
      const next = new Set(prev)
      next.delete(dayNumber)
      return next
    })
    setEditState((prev) => {
      const next = { ...prev }
      delete next[dayNumber]
      return next
    })
  }

  const updateEditState = (dayNumber: number, updates: Partial<ReturnType<typeof getEditState>>) => {
    const day = days.find((d) => d.dayNumber === dayNumber)
    if (!day) return
    const current = getEditState(day)
    setEditState((prev) => ({
      ...prev,
      [dayNumber]: { ...current, ...updates },
    }))
  }

  const handleSave = async (dayNumber: number) => {
    const day = days.find((d) => d.dayNumber === dayNumber)
    if (!day) return

    const state = getEditState(day)
    setSaving(dayNumber)

    try {
      const res = await fetch(`/api/trips/${tripId}/itinerary/${dayNumber}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          mainArea: state.mainArea || undefined,
          accommodation: state.accommodation || undefined,
          activities: state.activities,
          todos: state.todos,
          notes: state.notes,
        }),
      })

      if (res.ok) {
        const { itineraryDay } = await res.json()
        setDays((prev) =>
          prev.map((d) => (d.dayNumber === dayNumber ? { ...d, ...itineraryDay } : d))
        )
        cancelEditing(dayNumber)
      }
    } finally {
      setSaving(null)
    }
  }

  const addActivity = (dayNumber: number) => {
    const day = days.find((d) => d.dayNumber === dayNumber)
    if (!day) return
    const state = getEditState(day)
    updateEditState(dayNumber, {
      activities: [
        ...state.activities,
        { order: state.activities.length + 1, name: "", estimatedTime: "" },
      ],
    })
  }

  const updateActivity = (dayNumber: number, index: number, field: keyof Activity, value: string | number) => {
    const day = days.find((d) => d.dayNumber === dayNumber)
    if (!day) return
    const state = getEditState(day)
    const activities = [...state.activities]
    activities[index] = { ...activities[index], [field]: value }
    updateEditState(dayNumber, { activities })
  }

  const removeActivity = (dayNumber: number, index: number) => {
    const day = days.find((d) => d.dayNumber === dayNumber)
    if (!day) return
    const state = getEditState(day)
    updateEditState(dayNumber, {
      activities: state.activities.filter((_, i) => i !== index),
    })
  }

  const addNote = (dayNumber: number) => {
    const day = days.find((d) => d.dayNumber === dayNumber)
    if (!day) return
    const state = getEditState(day)
    updateEditState(dayNumber, { notes: [...state.notes, ""] })
  }

  const updateNote = (dayNumber: number, index: number, value: string) => {
    const day = days.find((d) => d.dayNumber === dayNumber)
    if (!day) return
    const state = getEditState(day)
    const notes = [...state.notes]
    notes[index] = value
    updateEditState(dayNumber, { notes })
  }

  const removeNote = (dayNumber: number, index: number) => {
    const day = days.find((d) => d.dayNumber === dayNumber)
    if (!day) return
    const state = getEditState(day)
    updateEditState(dayNumber, {
      notes: state.notes.filter((_, i) => i !== index),
    })
  }

  if (days.length === 0) {
    return (
      <div className="text-center py-12 text-muted-foreground">
        No itinerary days found.
      </div>
    )
  }

  return (
    <div ref={containerRef}>
    <Tabs defaultValue={`day-1`}>
      <TabsList className="gsap-enter flex flex-wrap h-auto gap-1 mb-6">
        {days.map((day) => (
          <TabsTrigger key={day.dayNumber} value={`day-${day.dayNumber}`} className="text-xs">
            Day {day.dayNumber}
          </TabsTrigger>
        ))}
      </TabsList>

      {days.map((day) => {
        const editing = isEditing(day.dayNumber)
        const state = getEditState(day)
        const dayDate = addDays(new Date(startDate), day.dayNumber - 1)

        return (
          <TabsContent key={day.dayNumber} value={`day-${day.dayNumber}`}>
            <div className="gsap-enter space-y-4">
              {/* Header */}
              <div className="flex items-center justify-between">
                <div>
                  <h2 className="text-lg font-semibold">Day {day.dayNumber}</h2>
                  <p className="text-sm text-muted-foreground">{format(dayDate, "EEEE, MMMM d, yyyy")}</p>
                </div>
                {editing ? (
                  <div className="flex gap-2">
                    <Button variant="outline" size="sm" onClick={() => cancelEditing(day.dayNumber)}>
                      Cancel
                    </Button>
                    <Button size="sm" onClick={() => handleSave(day.dayNumber)} disabled={saving === day.dayNumber}>
                      <Icon icon={saving === day.dayNumber ? "lucide:loader-2" : "lucide:check"} className={`w-4 h-4 mr-1 ${saving === day.dayNumber ? "animate-spin" : ""}`} />
                      {saving === day.dayNumber ? "Saving..." : "Save"}
                    </Button>
                  </div>
                ) : (
                  <Button variant="outline" size="sm" onClick={() => startEditing(day)}>
                    <Icon icon="lucide:pencil" className="w-4 h-4 mr-1" />
                    Edit
                  </Button>
                )}
              </div>

              {/* Location info */}
              {editing ? (
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label>Main Area</Label>
                    <Input
                      placeholder="e.g. Seminyak, Bali"
                      value={state.mainArea}
                      onChange={(e) => updateEditState(day.dayNumber, { mainArea: e.target.value })}
                    />
                  </div>
                  <div className="space-y-2">
                    <Label>Accommodation</Label>
                    <Input
                      placeholder="Hotel or Airbnb name"
                      value={state.accommodation}
                      onChange={(e) => updateEditState(day.dayNumber, { accommodation: e.target.value })}
                    />
                  </div>
                </div>
              ) : (day.mainArea || day.accommodation) ? (
                <div className="flex items-center gap-6 text-sm">
                  {day.mainArea && (
                    <div className="flex items-center gap-1.5 text-muted-foreground">
                      <Icon icon="lucide:map-pin" className="w-4 h-4 shrink-0" />
                      <span>{day.mainArea}</span>
                    </div>
                  )}
                  {day.accommodation && (
                    <div className="flex items-center gap-1.5 text-muted-foreground">
                      <Icon icon="lucide:bed" className="w-4 h-4 shrink-0" />
                      <span>{day.accommodation}</span>
                    </div>
                  )}
                </div>
              ) : null}

              {/* Activities */}
              <Card>
                <CardHeader className="pb-3">
                  <div className="flex items-center justify-between">
                    <CardTitle className="text-sm flex items-center gap-1.5">
                      <Icon icon="lucide:list-checks" className="w-4 h-4" />
                      Activities
                    </CardTitle>
                    {editing && (
                      <Button variant="outline" size="sm" className="h-7 text-xs" onClick={() => addActivity(day.dayNumber)}>
                        + Add
                      </Button>
                    )}
                  </div>
                </CardHeader>
                <CardContent className="space-y-2">
                  {state.activities.length === 0 ? (
                    <p className="text-sm text-muted-foreground">No activities yet.</p>
                  ) : editing ? (
                    state.activities.map((activity, i) => (
                      <div key={i} className="flex gap-2 items-center">
                        <span className="text-muted-foreground text-sm w-5 shrink-0">{i + 1}.</span>
                        <Input
                          placeholder="Activity name"
                          value={activity.name}
                          onChange={(e) => updateActivity(day.dayNumber, i, "name", e.target.value)}
                          className="flex-1"
                        />
                        <Input
                          placeholder="Time (e.g. 09:00)"
                          value={activity.estimatedTime ?? ""}
                          onChange={(e) => updateActivity(day.dayNumber, i, "estimatedTime", e.target.value)}
                          className="w-28"
                        />
                        <Button
                          variant="ghost"
                          size="icon"
                          className="h-9 w-9 text-muted-foreground hover:text-destructive shrink-0"
                          onClick={() => removeActivity(day.dayNumber, i)}
                        >
                          <Icon icon="lucide:x" className="w-4 h-4" />
                        </Button>
                      </div>
                    ))
                  ) : (
                    <ol className="space-y-1.5">
                      {state.activities.map((activity, i) => (
                        <li key={i} className="flex items-center gap-3 text-sm">
                          <span className="text-muted-foreground w-5 shrink-0">{i + 1}.</span>
                          <span className="flex-1">{activity.name || <span className="text-muted-foreground italic">Unnamed</span>}</span>
                          {activity.estimatedTime && (
                            <span className="text-xs text-muted-foreground flex items-center gap-1">
                              <Icon icon="lucide:clock" className="w-3 h-3" />
                              {activity.estimatedTime}
                            </span>
                          )}
                        </li>
                      ))}
                    </ol>
                  )}
                </CardContent>
              </Card>

              {/* Notes */}
              <Card>
                <CardHeader className="pb-3">
                  <div className="flex items-center justify-between">
                    <CardTitle className="text-sm flex items-center gap-1.5">
                      <Icon icon="lucide:sticky-note" className="w-4 h-4" />
                      Notes
                    </CardTitle>
                    {editing && (
                      <Button variant="outline" size="sm" className="h-7 text-xs" onClick={() => addNote(day.dayNumber)}>
                        + Add
                      </Button>
                    )}
                  </div>
                </CardHeader>
                <CardContent className="space-y-2">
                  {state.notes.length === 0 ? (
                    <p className="text-sm text-muted-foreground">No notes yet.</p>
                  ) : editing ? (
                    state.notes.map((note, i) => (
                      <div key={i} className="flex gap-2">
                        <Input
                          placeholder="Note..."
                          value={note}
                          onChange={(e) => updateNote(day.dayNumber, i, e.target.value)}
                          className="flex-1"
                        />
                        <Button
                          variant="ghost"
                          size="icon"
                          className="h-9 w-9 text-muted-foreground hover:text-destructive shrink-0"
                          onClick={() => removeNote(day.dayNumber, i)}
                        >
                          <Icon icon="lucide:x" className="w-4 h-4" />
                        </Button>
                      </div>
                    ))
                  ) : (
                    <ul className="space-y-1.5">
                      {state.notes.map((note, i) => (
                        <li key={i} className="flex items-start gap-2 text-sm">
                          <Icon icon="lucide:dot" className="w-4 h-4 mt-0.5 shrink-0 text-muted-foreground" />
                          <span>{note || <span className="text-muted-foreground italic">Empty note</span>}</span>
                        </li>
                      ))}
                    </ul>
                  )}
                </CardContent>
              </Card>
            </div>
          </TabsContent>
        )
      })}
    </Tabs>
    </div>
  )
}
