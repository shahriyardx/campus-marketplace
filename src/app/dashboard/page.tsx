"use client"

import { ImageOff, Pencil, Plus, Trash2 } from "lucide-react"
import Image from "next/image"
import Link from "next/link"
import { toast } from "sonner"
import { EmptyState } from "@/components/empty-state"
import { Button } from "@/components/ui/button"
import {
  Dialog,
  DialogClose,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import { Skeleton } from "@/components/ui/skeleton"
import {
  formatPrice,
  LISTING_STATUSES,
  type ListingStatus,
  STATUS_LABELS,
} from "@/lib/constants"
import { trpc } from "@/trpc/client"

export default function DashboardPage() {
  const utils = trpc.useUtils()
  const { data: listings, isLoading } = trpc.listing.mine.useQuery()

  const setStatus = trpc.listing.setStatus.useMutation({
    onSuccess: async () => {
      await Promise.all([
        utils.listing.mine.invalidate(),
        utils.listing.list.invalidate(),
      ])
      toast.success("Status updated")
    },
    onError: (error) => toast.error(error.message),
  })

  const remove = trpc.listing.remove.useMutation({
    onSuccess: async () => {
      await Promise.all([
        utils.listing.mine.invalidate(),
        utils.listing.list.invalidate(),
        utils.favorite.list.invalidate(),
        utils.message.conversations.invalidate(),
      ])
      toast.success("Listing deleted")
    },
    onError: (error) => toast.error(error.message),
  })

  return (
    <div className="mx-auto max-w-4xl px-5 py-10">
      <header className="flex flex-wrap items-end justify-between gap-4 border-b border-border pb-6">
        <div>
          <h1 className="font-display text-3xl">My listings</h1>
          <p className="mt-2 text-sm text-muted-foreground">
            Mark an item reserved while you arrange a meet-up, sold when it is
            gone.
          </p>
        </div>
        <Button asChild>
          <Link href="/listings/new">
            <Plus className="size-4" />
            New listing
          </Link>
        </Button>
      </header>

      {isLoading ? (
        <div className="space-y-3 pt-8">
          {Array.from({ length: 3 }, (_, index) => index).map((index) => (
            <Skeleton key={index} className="h-24 w-full rounded-md" />
          ))}
        </div>
      ) : listings?.length ? (
        <ul className="divide-y divide-border pt-2">
          {listings.map((listing) => (
            <li
              key={listing.id}
              className="flex flex-wrap items-center gap-4 py-5 sm:flex-nowrap"
            >
              <Link
                href={`/listings/${listing.id}`}
                className="relative size-20 shrink-0 overflow-hidden rounded-sm border border-border bg-muted"
              >
                {listing.images[0] ? (
                  <Image
                    src={listing.images[0].thumbUrl ?? listing.images[0].url}
                    alt=""
                    fill
                    sizes="80px"
                    className="object-cover"
                  />
                ) : (
                  <div className="grid h-full place-items-center text-muted-foreground">
                    <ImageOff className="size-4" />
                  </div>
                )}
              </Link>

              <div className="min-w-0 flex-1">
                <Link
                  href={`/listings/${listing.id}`}
                  className="line-clamp-1 font-medium hover:text-primary"
                >
                  {listing.title}
                </Link>
                <p className="numeric mt-1 text-sm text-muted-foreground">
                  {formatPrice(listing.price)}
                  <span className="mx-2 text-border">/</span>
                  {listing.category?.name ?? "Uncategorised"}
                </p>
              </div>

              <Select
                value={listing.status}
                onValueChange={(value) =>
                  setStatus.mutate({
                    id: listing.id,
                    status: value as ListingStatus,
                  })
                }
              >
                <SelectTrigger className="w-36 bg-card" size="sm">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {LISTING_STATUSES.map((status) => (
                    <SelectItem key={status} value={status}>
                      {STATUS_LABELS[status]}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>

              <div className="flex gap-1">
                <Button asChild variant="ghost" size="icon" aria-label="Edit">
                  <Link href={`/listings/${listing.id}/edit`}>
                    <Pencil className="size-4" />
                  </Link>
                </Button>

                <Dialog>
                  <DialogTrigger asChild>
                    <Button variant="ghost" size="icon" aria-label="Delete">
                      <Trash2 className="size-4" />
                    </Button>
                  </DialogTrigger>
                  <DialogContent>
                    <DialogHeader>
                      <DialogTitle className="font-display text-2xl">
                        Delete this listing?
                      </DialogTitle>
                      <DialogDescription>
                        “{listing.title}” and its saved copies and message
                        threads are removed for everyone. This cannot be undone.
                      </DialogDescription>
                    </DialogHeader>
                    <DialogFooter>
                      <DialogClose asChild>
                        <Button variant="ghost">Keep it</Button>
                      </DialogClose>
                      <DialogClose asChild>
                        <Button
                          variant="destructive"
                          onClick={() => remove.mutate({ id: listing.id })}
                        >
                          Delete listing
                        </Button>
                      </DialogClose>
                    </DialogFooter>
                  </DialogContent>
                </Dialog>
              </div>
            </li>
          ))}
        </ul>
      ) : (
        <div className="pt-8">
          <EmptyState
            title="No listings yet"
            description="Old textbooks, a calculator you no longer use, lab coats — post the first one and it shows up here."
            action={
              <Button asChild>
                <Link href="/listings/new">Post an item</Link>
              </Button>
            }
          />
        </div>
      )}
    </div>
  )
}
