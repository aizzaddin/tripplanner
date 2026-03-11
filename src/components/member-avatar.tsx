import { Avatar, AvatarFallback } from "@/components/ui/avatar"
import { cn } from "@/lib/utils"

interface MemberAvatarProps {
  name: string
  color?: string
  size?: "xs" | "sm" | "md"
  className?: string
}

function getInitials(name: string) {
  const parts = name.trim().split(/\s+/)
  if (parts.length >= 2) return (parts[0][0] + parts[1][0]).toUpperCase()
  return name.slice(0, 2).toUpperCase()
}

export default function MemberAvatar({ name, color, size = "sm", className }: MemberAvatarProps) {
  const sizeClass = {
    xs: "h-5 w-5 text-[9px]",
    sm: "h-7 w-7 text-xs",
    md: "h-9 w-9 text-sm",
  }[size]

  return (
    <Avatar className={cn(sizeClass, className)}>
      <AvatarFallback
        style={color ? { backgroundColor: color, color: "#fff" } : undefined}
        className={cn("font-semibold", !color && "bg-muted text-muted-foreground")}
      >
        {getInitials(name)}
      </AvatarFallback>
    </Avatar>
  )
}
