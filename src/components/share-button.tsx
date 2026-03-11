"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Icon } from "@iconify/react"

interface ShareButtonProps {
  tripId: string
  initialShareToken: string | null
}

export default function ShareButton({ tripId, initialShareToken }: ShareButtonProps) {
  const [shareToken, setShareToken] = useState<string | null>(initialShareToken)
  const [loading, setLoading] = useState(false)
  const [copied, setCopied] = useState(false)

  const shareUrl = shareToken
    ? (typeof window !== "undefined" ? window.location.origin : "") + "/share/" + shareToken
    : null

  const handleGenerate = async () => {
    setLoading(true)
    try {
      const res = await fetch(`/api/trips/${tripId}/share`, { method: "POST" })
      if (res.ok) {
        const { shareToken: token } = await res.json()
        setShareToken(token)
      }
    } finally {
      setLoading(false)
    }
  }

  const handleRevoke = async () => {
    setLoading(true)
    try {
      const res = await fetch(`/api/trips/${tripId}/share`, { method: "DELETE" })
      if (res.ok) {
        setShareToken(null)
      }
    } finally {
      setLoading(false)
    }
  }

  const handleCopy = async () => {
    if (!shareUrl) return
    await navigator.clipboard.writeText(shareUrl)
    setCopied(true)
    setTimeout(() => setCopied(false), 2000)
  }

  if (!shareToken) {
    return (
      <Button
        variant="outline"
        size="sm"
        onClick={handleGenerate}
        disabled={loading}
        className="gap-2"
      >
        <Icon icon="lucide:share-2" className="w-4 h-4" />
        Share
      </Button>
    )
  }

  return (
    <div className="flex items-center gap-2 min-w-0">
      <Input
        readOnly
        value={shareUrl ?? ""}
        className="h-8 text-xs w-28 sm:w-48 md:w-64 font-mono"
      />
      <Button
        variant="outline"
        size="sm"
        onClick={handleCopy}
        className="h-8 w-8 p-0"
        title="Copy link"
      >
        {copied ? (
          <Icon icon="lucide:check" className="w-4 h-4 text-green-600" />
        ) : (
          <Icon icon="lucide:copy" className="w-4 h-4" />
        )}
      </Button>
      <Button
        variant="outline"
        size="sm"
        onClick={handleRevoke}
        disabled={loading}
        className="h-8 w-8 p-0 text-destructive hover:text-destructive"
        title="Revoke link"
      >
        <Icon icon="lucide:link-2-off" className="w-4 h-4" />
      </Button>
    </div>
  )
}
