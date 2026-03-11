export type UrgencyLabel = "Overdue" | "This Week" | "This Month" | "Next To Do"

export function computeUrgency(dueDate: Date | null | undefined): UrgencyLabel | null {
  if (!dueDate) return null

  const today = new Date()
  today.setHours(0, 0, 0, 0)

  const due = new Date(dueDate)
  due.setHours(0, 0, 0, 0)

  const daysLeft = Math.floor((due.getTime() - today.getTime()) / (1000 * 60 * 60 * 24))

  if (daysLeft < 0) return "Overdue"
  if (daysLeft <= 7) return "This Week"
  if (daysLeft <= 30) return "This Month"
  return "Next To Do"
}

export interface TodoStats {
  overdue: number
  onProgress: number
  done: number
  total: number
  completion: number // 0-100 percentage
}

export function computeTodoStats(
  todos: Array<{ task: string; isDone: boolean; dueDate: Date | null }>
): TodoStats {
  const today = new Date()
  today.setHours(0, 0, 0, 0)

  let overdue = 0
  let onProgress = 0
  let done = 0

  for (const todo of todos) {
    if (!todo.task) continue

    if (todo.isDone) {
      done++
    } else {
      onProgress++
      if (todo.dueDate) {
        const due = new Date(todo.dueDate)
        due.setHours(0, 0, 0, 0)
        if (due < today) {
          overdue++
        }
      }
    }
  }

  const total = onProgress + done
  const completion = total > 0 ? Math.round((done / total) * 100) : 0

  return {
    overdue,
    onProgress,
    done,
    total,
    completion,
  }
}
