"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import CreateTripForm from "@/components/forms/create-trip-form"
import { Icon } from "@iconify/react"

export default function NewTripDialog() {
  const [open, setOpen] = useState(false)
  const router = useRouter()

  const handleSuccess = () => {
    setOpen(false)
    router.refresh()
  }

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button className="gap-2">
          <Icon icon="lucide:plus" className="w-4 h-4" />
          New Trip
        </Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>Create New Trip</DialogTitle>
          <DialogDescription>
            Fill in the details to create a new trip.
          </DialogDescription>
        </DialogHeader>
        <CreateTripForm onSuccess={handleSuccess} />
      </DialogContent>
    </Dialog>
  )
}
