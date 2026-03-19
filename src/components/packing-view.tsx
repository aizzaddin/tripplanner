"use client"

import { useState } from "react"
import { useGsapEntrance } from "@/lib/hooks/use-gsap-entrance"
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

interface Member {
  id: string
  name: string
  color: string
}

interface PackingItem {
  id: string
  item: string
  qty: number
  isDone: boolean
  assignedToId: string | null
  assignedTo: Member | null
}

interface PackingViewProps {
  tripId: string
  members: Member[]
  initialItems: PackingItem[]
}

export default function PackingView({ tripId, members, initialItems }: PackingViewProps) {
  const containerRef = useGsapEntrance()
  const [items, setItems] = useState(initialItems)
  const [dialogOpen, setDialogOpen] = useState(false)
  const [loading, setLoading] = useState(false)

  const [itemName, setItemName] = useState("")
  const [qty, setQty] = useState("1")
  const [assignedToId, setAssignedToId] = useState("")

  const refreshItems = async () => {
    const res = await fetch(`/api/trips/${tripId}/packing`)
    if (res.ok) {
      const { items } = await res.json()
      setItems(items)
    }
  }

  const handleAdd = async () => {
    if (!itemName.trim()) return
    setLoading(true)
    try {
      await fetch(`/api/trips/${tripId}/packing`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          item: itemName,
          qty: parseInt(qty) || 1,
          assignedToId: assignedToId || undefined,
        }),
      })
      setDialogOpen(false)
      setItemName("")
      setQty("1")
      setAssignedToId("")
      await refreshItems()
    } finally {
      setLoading(false)
    }
  }

  const handleToggle = async (packingItem: PackingItem) => {
    await fetch(`/api/trips/${tripId}/packing/${packingItem.id}`, {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        item: packingItem.item,
        qty: packingItem.qty,
        assignedToId: packingItem.assignedToId || undefined,
        isDone: !packingItem.isDone,
      }),
    })
    await refreshItems()
  }

  const handleDelete = async (itemId: string) => {
    if (!confirm("Remove this item?")) return
    await fetch(`/api/trips/${tripId}/packing/${itemId}`, { method: "DELETE" })
    await refreshItems()
  }

  // Group by assignee
  const grouped: Record<string, PackingItem[]> = {}
  for (const item of items) {
    const key = item.assignedToId ?? "unassigned"
    if (!grouped[key]) grouped[key] = []
    grouped[key].push(item)
  }

  const getMemberById = (id: string) => members.find((m) => m.id === id)

  const totalItems = items.length
  const packedItems = items.filter((i) => i.isDone).length

  return (
    <div ref={containerRef} className="space-y-6">
      <div className="gsap-enter flex items-center justify-between">
        <div>
          <h2 className="text-lg font-black tracking-tight font-sans">Packing List</h2>
          <p className="text-sm text-muted-foreground">
            {packedItems} / {totalItems} packed
          </p>
        </div>
        <Button onClick={() => setDialogOpen(true)}>+ Add Item</Button>
      </div>

      {items.length === 0 ? (
        <div className="text-center py-12 text-muted-foreground">
          No packing items yet. Add your first one!
        </div>
      ) : (
        <div className="gsap-enter space-y-4">
          {/* Unassigned items */}
          {grouped["unassigned"] && grouped["unassigned"].length > 0 && (
            <Card>
              <CardHeader className="pb-3">
                <CardTitle className="text-sm">General</CardTitle>
              </CardHeader>
              <CardContent className="space-y-2">
                {grouped["unassigned"].map((packingItem) => (
                  <PackingItemRow
                    key={packingItem.id}
                    item={packingItem}
                    onToggle={() => handleToggle(packingItem)}
                    onDelete={() => handleDelete(packingItem.id)}
                  />
                ))}
              </CardContent>
            </Card>
          )}

          {/* Items by member */}
          {members.map((member) => {
            const memberItems = grouped[member.id]
            if (!memberItems || memberItems.length === 0) return null
            return (
              <Card key={member.id}>
                <CardHeader className="pb-3">
                  <div className="flex items-center gap-2">
                    <MemberAvatar name={member.name} color={member.color} size="xs" />
                    <CardTitle className="text-sm">{member.name}</CardTitle>
                    <Badge variant="outline" className="text-xs">
                      {memberItems.filter((i) => i.isDone).length}/{memberItems.length}
                    </Badge>
                  </div>
                </CardHeader>
                <CardContent className="space-y-2">
                  {memberItems.map((packingItem) => (
                    <PackingItemRow
                      key={packingItem.id}
                      item={packingItem}
                      onToggle={() => handleToggle(packingItem)}
                      onDelete={() => handleDelete(packingItem.id)}
                    />
                  ))}
                </CardContent>
              </Card>
            )
          })}
        </div>
      )}

      <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>Add Packing Item</DialogTitle>
          </DialogHeader>
          <div className="space-y-4">
            <div className="space-y-2">
              <Label>Item</Label>
              <Input
                placeholder="e.g. Passport, Sunscreen"
                value={itemName}
                onChange={(e) => setItemName(e.target.value)}
              />
            </div>

            <div className="space-y-2">
              <Label>Quantity</Label>
              <Input
                type="number"
                min="1"
                value={qty}
                onChange={(e) => setQty(e.target.value)}
              />
            </div>

            <div className="space-y-2">
              <Label>Assigned To</Label>
              <Select
                value={assignedToId || "none"}
                onValueChange={(v) => setAssignedToId(v === "none" ? "" : v)}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Anyone / General" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="none">Anyone / General</SelectItem>
                  {members.map((m) => (
                    <SelectItem key={m.id} value={m.id}>{m.name}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <Button
              className="w-full"
              onClick={handleAdd}
              disabled={loading || !itemName.trim()}
            >
              {loading ? "Adding..." : "Add Item"}
            </Button>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  )
}

function PackingItemRow({
  item,
  onToggle,
  onDelete,
}: {
  item: PackingItem
  onToggle: () => void
  onDelete: () => void
}) {
  return (
    <div className={`flex items-center gap-3 ${item.isDone ? "opacity-50" : ""}`}>
      <Checkbox checked={item.isDone} onCheckedChange={onToggle} />
      <span className={`flex-1 text-sm ${item.isDone ? "line-through" : ""}`}>
        {item.item}
        {item.qty > 1 && (
          <span className="text-muted-foreground ml-2 text-xs">x{item.qty}</span>
        )}
      </span>
      <Button
        variant="ghost"
        size="sm"
        className="h-7 px-2 text-xs text-destructive hover:text-destructive"
        onClick={onDelete}
      >
        Del
      </Button>
    </div>
  )
}
