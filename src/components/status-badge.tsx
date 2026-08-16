import { type ListingStatus, STATUS_LABELS } from "@/lib/constants"
import { cn } from "@/lib/utils"

const TONE: Record<ListingStatus, string> = {
  AVAILABLE: "border-border bg-card text-muted-foreground",
  RESERVED: "border-primary/30 bg-primary/10 text-primary",
  SOLD: "border-foreground/20 bg-foreground text-background",
}

export function StatusBadge({
  status,
  className,
}: {
  status: ListingStatus
  className?: string
}) {
  return (
    <span
      className={cn(
        "label-caps inline-flex items-center rounded-sm border px-1.5 py-1",
        TONE[status],
        className,
      )}
    >
      {STATUS_LABELS[status]}
    </span>
  )
}
