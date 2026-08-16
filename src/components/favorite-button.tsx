"use client"

import { Heart } from "lucide-react"
import { useRouter } from "next/navigation"
import { toast } from "sonner"
import { cn } from "@/lib/utils"
import { trpc } from "@/trpc/client"

export function FavoriteButton({
  listingId,
  className,
  withLabel = false,
}: {
  listingId: string
  className?: string
  withLabel?: boolean
}) {
  const router = useRouter()
  const utils = trpc.useUtils()

  const { data: me } = trpc.user.me.useQuery()
  const { data: favoriteIds } = trpc.favorite.ids.useQuery(undefined, {
    enabled: Boolean(me),
  })

  const favorited = favoriteIds?.includes(listingId) ?? false

  const toggle = trpc.favorite.toggle.useMutation({
    onSuccess: async (result) => {
      await Promise.all([
        utils.favorite.ids.invalidate(),
        utils.favorite.list.invalidate(),
      ])
      toast.success(
        result.favorited ? "Saved to favorites" : "Removed from favorites",
      )
    },
    onError: (error) => toast.error(error.message),
  })

  return (
    <button
      type="button"
      aria-pressed={favorited}
      aria-label={favorited ? "Remove from favorites" : "Save to favorites"}
      disabled={toggle.isPending}
      onClick={(event) => {
        event.preventDefault()
        event.stopPropagation()
        if (!me) {
          router.push("/login?next=/listings")
          return
        }
        toggle.mutate({ id: listingId })
      }}
      className={cn(
        "inline-flex items-center gap-2 rounded-sm border border-border bg-card/90 px-2 py-1.5 text-sm backdrop-blur transition-colors hover:border-primary/40 hover:text-primary disabled:opacity-60",
        favorited && "border-primary/40 text-primary",
        className,
      )}
    >
      <Heart className={cn("size-4", favorited && "fill-current")} />
      {withLabel ? (favorited ? "Saved" : "Save") : null}
    </button>
  )
}
