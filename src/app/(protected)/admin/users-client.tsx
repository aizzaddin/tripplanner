"use client"

import { useState } from "react"
import { format } from "date-fns"
import { Icon } from "@iconify/react"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Card, CardContent } from "@/components/ui/card"

type UserStatus = "PENDING" | "ACTIVE" | "BANNED"
type UserRole = "USER" | "ADMIN"

interface AdminUser {
  id: string
  name: string
  email: string
  role: UserRole
  status: UserStatus
  createdAt: Date
  _count: { trips: number }
}

interface AdminUsersClientProps {
  users: AdminUser[]
  currentUserId: string
}

const statusVariant: Record<UserStatus, "default" | "secondary" | "destructive" | "outline"> = {
  ACTIVE: "default",
  PENDING: "secondary",
  BANNED: "destructive",
}

const statusIcon: Record<UserStatus, string> = {
  ACTIVE: "lucide:check-circle",
  PENDING: "lucide:clock",
  BANNED: "lucide:ban",
}

export default function AdminUsersClient({ users: initialUsers, currentUserId }: AdminUsersClientProps) {
  const [users, setUsers] = useState(initialUsers)
  const [loading, setLoading] = useState<string | null>(null)
  const [confirmDelete, setConfirmDelete] = useState<string | null>(null)

  const deleteUser = async (userId: string) => {
    setLoading(userId)
    try {
      const res = await fetch(`/api/admin/users/${userId}`, { method: "DELETE" })
      if (res.ok) {
        setUsers((prev) => prev.filter((u) => u.id !== userId))
        setConfirmDelete(null)
      }
    } finally {
      setLoading(null)
    }
  }

  const updateUser = async (userId: string, data: { status?: UserStatus; role?: UserRole }) => {
    setLoading(userId)
    try {
      const res = await fetch(`/api/admin/users/${userId}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(data),
      })
      if (res.ok) {
        const { user } = await res.json()
        setUsers((prev) => prev.map((u) => (u.id === userId ? { ...u, ...user } : u)))
      }
    } finally {
      setLoading(null)
    }
  }

  const pendingCount = users.filter((u) => u.status === "PENDING").length

  return (
    <div className="space-y-4">
      {pendingCount > 0 && (
        <div className="flex items-center gap-2 bg-amber-50 border border-amber-200 text-amber-800 rounded-lg px-4 py-3 text-sm">
          <Icon icon="lucide:clock" className="w-4 h-4 shrink-0" />
          <span><strong>{pendingCount}</strong> user{pendingCount !== 1 ? "s" : ""} waiting for approval</span>
        </div>
      )}

      <Card>
        <CardContent className="p-0">
          <div className="divide-y">
            {users.map((user) => {
              const isCurrentUser = user.id === currentUserId
              const isLoading = loading === user.id

              return (
                <div key={user.id} className="flex items-center gap-4 px-6 py-4">
                  {/* Avatar */}
                  <div className="w-9 h-9 rounded-full bg-primary/10 flex items-center justify-center text-primary font-semibold text-sm shrink-0">
                    {user.name[0].toUpperCase()}
                  </div>

                  {/* Info */}
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2">
                      <p className="text-sm font-medium truncate">{user.name}</p>
                      {isCurrentUser && (
                        <span className="text-xs text-muted-foreground">(you)</span>
                      )}
                      {user.role === "ADMIN" && (
                        <Badge variant="outline" className="text-xs h-5 px-1.5">
                          <Icon icon="lucide:shield" className="w-3 h-3 mr-1" />
                          Admin
                        </Badge>
                      )}
                    </div>
                    <p className="text-xs text-muted-foreground truncate">{user.email}</p>
                    <p className="text-xs text-muted-foreground mt-0.5">
                      {user._count.trips} trip{user._count.trips !== 1 ? "s" : ""} · Joined {format(new Date(user.createdAt), "MMM d, yyyy")}
                    </p>
                  </div>

                  {/* Status badge */}
                  <Badge variant={statusVariant[user.status]} className="shrink-0 gap-1">
                    <Icon icon={statusIcon[user.status]} className="w-3 h-3" />
                    {user.status.charAt(0) + user.status.slice(1).toLowerCase()}
                  </Badge>

                  {/* Actions */}
                  {!isCurrentUser && (
                    <div className="flex items-center gap-2 shrink-0">
                      {user.status === "PENDING" && (
                        <Button
                          size="sm"
                          variant="outline"
                          className="h-8 text-xs gap-1.5 text-green-700 border-green-200 hover:bg-green-50"
                          onClick={() => updateUser(user.id, { status: "ACTIVE" })}
                          disabled={isLoading}
                        >
                          <Icon icon="lucide:check" className="w-3.5 h-3.5" />
                          Approve
                        </Button>
                      )}
                      {user.status === "ACTIVE" && (
                        <Button
                          size="sm"
                          variant="outline"
                          className="h-8 text-xs gap-1.5 text-destructive border-destructive/30 hover:bg-destructive/10"
                          onClick={() => updateUser(user.id, { status: "BANNED" })}
                          disabled={isLoading}
                        >
                          <Icon icon="lucide:ban" className="w-3.5 h-3.5" />
                          Ban
                        </Button>
                      )}
                      {user.status === "BANNED" && (
                        <Button
                          size="sm"
                          variant="outline"
                          className="h-8 text-xs gap-1.5"
                          onClick={() => updateUser(user.id, { status: "ACTIVE" })}
                          disabled={isLoading}
                        >
                          <Icon icon="lucide:check-circle" className="w-3.5 h-3.5" />
                          Unban
                        </Button>
                      )}
                      <Button
                        size="sm"
                        variant="ghost"
                        className="h-8 w-8 p-0 text-muted-foreground"
                        onClick={() => updateUser(user.id, { role: user.role === "ADMIN" ? "USER" : "ADMIN" })}
                        disabled={isLoading}
                        title={user.role === "ADMIN" ? "Remove admin" : "Make admin"}
                      >
                        <Icon icon={user.role === "ADMIN" ? "lucide:shield-off" : "lucide:shield"} className="w-3.5 h-3.5" />
                      </Button>

                      {confirmDelete === user.id ? (
                        <div className="flex items-center gap-1">
                          <Button
                            size="sm"
                            variant="destructive"
                            className="h-8 text-xs px-2"
                            onClick={() => deleteUser(user.id)}
                            disabled={isLoading}
                          >
                            Confirm
                          </Button>
                          <Button
                            size="sm"
                            variant="ghost"
                            className="h-8 text-xs px-2"
                            onClick={() => setConfirmDelete(null)}
                          >
                            Cancel
                          </Button>
                        </div>
                      ) : (
                        <Button
                          size="sm"
                          variant="ghost"
                          className="h-8 w-8 p-0 text-muted-foreground hover:text-destructive"
                          onClick={() => setConfirmDelete(user.id)}
                          disabled={isLoading}
                          title="Delete user"
                        >
                          <Icon icon="lucide:trash-2" className="w-3.5 h-3.5" />
                        </Button>
                      )}
                    </div>
                  )}
                </div>
              )
            })}
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
