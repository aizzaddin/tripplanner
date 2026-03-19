"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Icon } from "@iconify/react"
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog"

interface Collaborator {
  id: string
  user: { id: string; name: string; email: string }
}

interface CollaboratorsManagerProps {
  tripId: string
  isOwner: boolean
  initialCollaborators: Collaborator[]
  ownerId: string
  ownerName: string
}

export default function CollaboratorsManager({
  tripId,
  isOwner,
  initialCollaborators,
  ownerName,
}: CollaboratorsManagerProps) {
  const [collaborators, setCollaborators] = useState<Collaborator[]>(initialCollaborators)
  const [email, setEmail] = useState("")
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [open, setOpen] = useState(false)

  const handleAdd = async () => {
    setError(null)
    if (!email.trim()) return
    setLoading(true)
    try {
      const res = await fetch(`/api/trips/${tripId}/collaborators`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email: email.trim() }),
      })
      const data = await res.json()
      if (!res.ok) {
        setError(data.error ?? "Failed to add collaborator")
        return
      }
      setCollaborators((prev) => [...prev, data.collaborator])
      setEmail("")
    } finally {
      setLoading(false)
    }
  }

  const handleRemove = async (userId: string) => {
    try {
      const res = await fetch(`/api/trips/${tripId}/collaborators/${userId}`, {
        method: "DELETE",
      })
      if (res.ok) {
        setCollaborators((prev) => prev.filter((c) => c.user.id !== userId))
      }
    } catch {
      // ignore
    }
  }

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button variant="outline" size="sm" className="gap-2">
          <Icon icon="lucide:user-plus" className="w-4 h-4" />
          <span className="hidden sm:inline">Collaborators</span>
        </Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>Trip Collaborators</DialogTitle>
        </DialogHeader>

        <div className="space-y-4 py-2">
          {/* Owner */}
          <div>
            <p className="text-xs font-medium text-muted-foreground uppercase tracking-wide mb-2">
              Owner
            </p>
            <div className="flex items-center gap-2 px-3 py-2 rounded-md bg-muted/50">
              <div className="w-7 h-7 rounded-full bg-primary/10 flex items-center justify-center shrink-0">
                <Icon icon="lucide:crown" className="w-3.5 h-3.5 text-primary" />
              </div>
              <span className="text-sm font-medium">{ownerName}</span>
            </div>
          </div>

          {/* Collaborators list */}
          <div>
            <p className="text-xs font-medium text-muted-foreground uppercase tracking-wide mb-2">
              Collaborators {collaborators.length > 0 && `(${collaborators.length})`}
            </p>
            {collaborators.length === 0 ? (
              <p className="text-sm text-muted-foreground px-1">No collaborators yet.</p>
            ) : (
              <ul className="space-y-1.5">
                {collaborators.map((c) => (
                  <li
                    key={c.id}
                    className="flex items-center gap-2 px-3 py-2 rounded-md bg-muted/50"
                  >
                    <div className="w-7 h-7 rounded-full bg-secondary flex items-center justify-center shrink-0">
                      <Icon icon="lucide:user" className="w-3.5 h-3.5 text-muted-foreground" />
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-medium truncate">{c.user.name}</p>
                      <p className="text-xs text-muted-foreground truncate">{c.user.email}</p>
                    </div>
                    {isOwner && (
                      <Button
                        variant="ghost"
                        size="sm"
                        className="h-7 w-7 p-0 text-muted-foreground hover:text-destructive"
                        onClick={() => handleRemove(c.user.id)}
                        title="Remove collaborator"
                      >
                        <Icon icon="lucide:x" className="w-3.5 h-3.5" />
                      </Button>
                    )}
                  </li>
                ))}
              </ul>
            )}
          </div>

          {/* Add collaborator (owner only) */}
          {isOwner && (
            <div>
              <p className="text-xs font-medium text-muted-foreground uppercase tracking-wide mb-2">
                Add by email
              </p>
              <div className="flex gap-2">
                <Input
                  placeholder="user@example.com"
                  value={email}
                  onChange={(e) => {
                    setEmail(e.target.value)
                    setError(null)
                  }}
                  onKeyDown={(e) => e.key === "Enter" && handleAdd()}
                  disabled={loading}
                  className="h-9"
                />
                <Button
                  size="sm"
                  onClick={handleAdd}
                  disabled={loading || !email.trim()}
                  className="h-9 shrink-0"
                >
                  {loading ? (
                    <Icon icon="lucide:loader-2" className="w-4 h-4 animate-spin" />
                  ) : (
                    <Icon icon="lucide:plus" className="w-4 h-4" />
                  )}
                </Button>
              </div>
              {error && <p className="text-xs text-destructive mt-1.5">{error}</p>}
            </div>
          )}
        </div>
      </DialogContent>
    </Dialog>
  )
}
