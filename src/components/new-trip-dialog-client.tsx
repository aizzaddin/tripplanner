"use client"

import dynamic from "next/dynamic"

const NewTripDialog = dynamic(() => import("@/components/new-trip-dialog"), { ssr: false })

export default function NewTripDialogClient() {
  return <NewTripDialog />
}
