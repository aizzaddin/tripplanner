"use client"

import { useState } from "react"
import { format } from "date-fns"
import { computeUrgency } from "@/lib/business/todo"
import type { UrgencyLabel } from "@/lib/business/todo"
import { TODO_PRIORITIES } from "@/lib/constants"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Checkbox } from "@/components/ui/checkbox"
import { Badge } from "@/components/ui/badge"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
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
import MemberAvatar from "@/components/member-avatar"
import { InlineDatePicker } from "@/components/ui/inline-date-picker"
import { Icon } from "@iconify/react"

interface Member {
  id: string
  name: string
  color: string
}

interface TodoItem {
  id: string
  task: string
  isDone: boolean
  priority: string
  dueDate: string | null
  assignedToId: string | null
  assignedTo: Member | null
}

interface TodosViewProps {
  tripId: string
  members: Member[]
  initialTodos: TodoItem[]
}

const URGENCY_ORDER: (UrgencyLabel | null)[] = ["Overdue", "This Week", "This Month", "Next To Do", null]

const urgencyVariant: Record<string, "destructive" | "default" | "secondary" | "outline"> = {
  Overdue: "destructive",
  "This Week": "default",
  "This Month": "secondary",
  "Next To Do": "outline",
}

export default function TodosView({ tripId, members, initialTodos }: TodosViewProps) {
  const [todos, setTodos] = useState(initialTodos)
  const [dialogOpen, setDialogOpen] = useState(false)
  const [editTodo, setEditTodo] = useState<TodoItem | null>(null)
  const [loading, setLoading] = useState(false)

  // Form state
  const [task, setTask] = useState("")
  const [priority, setPriority] = useState("MEDIUM")
  const [dueDate, setDueDate] = useState("")
  const [assignedToId, setAssignedToId] = useState("")

  const openAddDialog = () => {
    setEditTodo(null)
    setTask("")
    setPriority("MEDIUM")
    setDueDate("")
    setAssignedToId("")
    setDialogOpen(true)
  }

  const openEditDialog = (todo: TodoItem) => {
    setEditTodo(todo)
    setTask(todo.task)
    setPriority(todo.priority)
    setDueDate(todo.dueDate ? format(new Date(todo.dueDate), "yyyy-MM-dd") : "")
    setAssignedToId(todo.assignedToId ?? "")
    setDialogOpen(true)
  }

  const refreshTodos = async () => {
    const res = await fetch(`/api/trips/${tripId}/todos`)
    if (res.ok) {
      const { todos } = await res.json()
      setTodos(todos)
    }
  }

  const handleSubmit = async () => {
    if (!task.trim()) return
    setLoading(true)

    const payload = {
      task,
      priority,
      dueDate: dueDate || undefined,
      assignedToId: assignedToId || undefined,
    }

    try {
      if (editTodo) {
        await fetch(`/api/trips/${tripId}/todos/${editTodo.id}`, {
          method: "PUT",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ ...payload, isDone: editTodo.isDone }),
        })
      } else {
        await fetch(`/api/trips/${tripId}/todos`, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(payload),
        })
      }
      setDialogOpen(false)
      await refreshTodos()
    } finally {
      setLoading(false)
    }
  }

  const handleToggleDone = async (todo: TodoItem) => {
    await fetch(`/api/trips/${tripId}/todos/${todo.id}`, {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        task: todo.task,
        priority: todo.priority,
        dueDate: todo.dueDate ? format(new Date(todo.dueDate), "yyyy-MM-dd") : undefined,
        assignedToId: todo.assignedToId || undefined,
        isDone: !todo.isDone,
      }),
    })
    await refreshTodos()
  }

  const handleDelete = async (todoId: string) => {
    if (!confirm("Delete this task?")) return
    await fetch(`/api/trips/${tripId}/todos/${todoId}`, { method: "DELETE" })
    await refreshTodos()
  }

  // Group todos by urgency
  const grouped = URGENCY_ORDER.reduce<Record<string, TodoItem[]>>((acc, label) => {
    const key = label ?? "No Due Date"
    acc[key] = todos.filter((t) => {
      const urgency = computeUrgency(t.dueDate ? new Date(t.dueDate) : null)
      return urgency === label
    })
    return acc
  }, {})

  const pendingByGroup = Object.entries(grouped).filter(([, items]) =>
    items.some((t) => !t.isDone)
  )

  const doneTodos = todos.filter((t) => t.isDone)

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-lg font-semibold">To-Do List</h2>
          <p className="text-sm text-muted-foreground">
            {todos.filter((t) => t.isDone).length} / {todos.length} completed
          </p>
        </div>
        <Button onClick={openAddDialog}>+ Add Task</Button>
      </div>

      {todos.length === 0 ? (
        <div className="text-center py-12 text-muted-foreground">
          No tasks yet. Add your first one!
        </div>
      ) : (
        <div className="space-y-6">
          {/* Pending todos grouped by urgency */}
          {pendingByGroup.map(([label, items]) => {
            const pending = items.filter((t) => !t.isDone)
            if (pending.length === 0) return null
            return (
              <Card key={label}>
                <CardHeader className="pb-3">
                  <div className="flex items-center gap-2">
                    <CardTitle className="text-sm">{label}</CardTitle>
                    <Badge variant={urgencyVariant[label] ?? "outline"} className="text-xs">
                      {pending.length}
                    </Badge>
                  </div>
                </CardHeader>
                <CardContent className="space-y-2">
                  {pending.map((todo) => (
                    <TodoRow
                      key={todo.id}
                      todo={todo}
                      onToggle={() => handleToggleDone(todo)}
                      onEdit={() => openEditDialog(todo)}
                      onDelete={() => handleDelete(todo.id)}
                    />
                  ))}
                </CardContent>
              </Card>
            )
          })}

          {/* Done todos */}
          {doneTodos.length > 0 && (
            <Card>
              <CardHeader className="pb-3">
                <CardTitle className="text-sm text-muted-foreground">Completed ({doneTodos.length})</CardTitle>
              </CardHeader>
              <CardContent className="space-y-2">
                {doneTodos.map((todo) => (
                  <TodoRow
                    key={todo.id}
                    todo={todo}
                    onToggle={() => handleToggleDone(todo)}
                    onEdit={() => openEditDialog(todo)}
                    onDelete={() => handleDelete(todo.id)}
                  />
                ))}
              </CardContent>
            </Card>
          )}
        </div>
      )}

      <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>{editTodo ? "Edit Task" : "Add Task"}</DialogTitle>
          </DialogHeader>
          <div className="space-y-4">
            <div className="space-y-2">
              <Label>Task</Label>
              <Input
                placeholder="What needs to be done?"
                value={task}
                onChange={(e) => setTask(e.target.value)}
              />
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div className="space-y-2">
                <Label>Priority</Label>
                <Select value={priority} onValueChange={setPriority}>
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {TODO_PRIORITIES.map((p) => (
                      <SelectItem key={p} value={p}>{p}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <Label>Due Date</Label>
                <InlineDatePicker
                  value={dueDate}
                  onChange={setDueDate}
                  placeholder="Pick a date"
                />
              </div>
            </div>

            <div className="space-y-2">
              <Label>Assigned To</Label>
              <Select
                value={assignedToId || "none"}
                onValueChange={(v) => setAssignedToId(v === "none" ? "" : v)}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Unassigned" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="none">Unassigned</SelectItem>
                  {members.map((m) => (
                    <SelectItem key={m.id} value={m.id}>{m.name}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <Button className="w-full" onClick={handleSubmit} disabled={loading || !task.trim()}>
              {loading ? "Saving..." : editTodo ? "Save Changes" : "Add Task"}
            </Button>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  )
}

function TodoRow({
  todo,
  onToggle,
  onEdit,
  onDelete,
}: {
  todo: TodoItem
  onToggle: () => void
  onEdit: () => void
  onDelete: () => void
}) {
  const priorityColor: Record<string, string> = {
    HIGH: "text-red-500",
    MEDIUM: "text-amber-500",
    LOW: "text-green-600",
  }

  return (
    <div className={`flex items-start gap-3 ${todo.isDone ? "opacity-50" : ""}`}>
      <Checkbox
        checked={todo.isDone}
        onCheckedChange={onToggle}
        className="mt-0.5"
      />
      <div className="flex-1 min-w-0">
        <p className={`text-sm ${todo.isDone ? "line-through" : ""}`}>{todo.task}</p>
        <div className="flex items-center gap-2 mt-1">
          <span className={`text-xs font-medium ${priorityColor[todo.priority] ?? ""}`}>
            {todo.priority}
          </span>
          {todo.dueDate && (
            <span className="text-xs text-muted-foreground">
              Due {format(new Date(todo.dueDate), "MMM d")}
            </span>
          )}
          {todo.assignedTo && (
            <div className="flex items-center gap-1" title={todo.assignedTo.name}>
              <MemberAvatar name={todo.assignedTo.name} color={todo.assignedTo.color} size="xs" />
              <span className="text-xs text-muted-foreground">{todo.assignedTo.name}</span>
            </div>
          )}
        </div>
      </div>
      <div className="flex gap-0.5">
        <Button variant="ghost" size="icon" className="h-7 w-7 text-muted-foreground hover:text-foreground" onClick={onEdit}>
          <Icon icon="lucide:pencil" className="w-3.5 h-3.5" />
        </Button>
        <Button
          variant="ghost"
          size="icon"
          className="h-7 w-7 text-muted-foreground hover:text-destructive"
          onClick={onDelete}
        >
          <Icon icon="lucide:trash-2" className="w-3.5 h-3.5" />
        </Button>
      </div>
    </div>
  )
}
