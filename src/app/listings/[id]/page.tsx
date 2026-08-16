"use client"

import { formatDistanceToNow } from "date-fns"
import { ImageOff, MapPin, MessageSquare, Pencil } from "lucide-react"
import Image from "next/image"
import Link from "next/link"
import { useParams, useRouter } from "next/navigation"
import { useState } from "react"
import { toast } from "sonner"
import { FavoriteButton } from "@/components/favorite-button"
import { StatusBadge } from "@/components/status-badge"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Button } from "@/components/ui/button"
import { Skeleton } from "@/components/ui/skeleton"
import { CONDITION_LABELS, formatPrice } from "@/lib/constants"
import type { ListingImageDTO } from "@/lib/serialize"
import { cn } from "@/lib/utils"
import { trpc } from "@/trpc/client"

function Gallery({
  images,
  title,
}: {
  images: ListingImageDTO[]
  title: string
}) {
  const [active, setActive] = useState(0)
  const current = images[active]

  return (
    <div className="space-y-3">
      <div className="relative aspect-[4/3] overflow-hidden rounded-md border border-border bg-muted">
        {current ? (
          <Image
            src={current.url}
            alt={title}
            fill
            sizes="(min-width: 1024px) 640px, 100vw"
            className="object-cover"
            priority
          />
        ) : (
          <div className="grid h-full place-items-center text-muted-foreground">
            <ImageOff className="size-8" />
          </div>
        )}
      </div>

      {images.length > 1 ? (
        <div className="flex gap-3">
          {images.map((image, index) => (
            <button
              key={image.url}
              type="button"
              onClick={() => setActive(index)}
              aria-label={`Photo ${index + 1}`}
              className={cn(
                "relative size-16 overflow-hidden rounded-sm border transition-colors",
                index === active
                  ? "border-primary"
                  : "border-border hover:border-muted-foreground",
              )}
            >
              <Image
                src={image.thumbUrl ?? image.url}
                alt=""
                fill
                sizes="64px"
                className="object-cover"
              />
            </button>
          ))}
        </div>
      ) : null}
    </div>
  )
}

export default function ListingDetailPage() {
  const params = useParams<{ id: string }>()
  const router = useRouter()

  const { data: me } = trpc.user.me.useQuery()
  const {
    data: listing,
    isLoading,
    error,
  } = trpc.listing.byId.useQuery({
    id: params.id,
  })

  const startChat = trpc.message.startOrGet.useMutation({
    onSuccess: ({ id }) => router.push(`/messages/${id}`),
    onError: (mutationError) => toast.error(mutationError.message),
  })

  if (error) {
    return (
      <div className="mx-auto max-w-6xl px-5 py-24 text-center">
        <h1 className="font-display text-3xl">Listing not found</h1>
        <p className="mt-2 text-sm text-muted-foreground">
          It may have been sold and removed.
        </p>
        <Button asChild variant="outline" className="mt-6 bg-card">
          <Link href="/listings">Back to listings</Link>
        </Button>
      </div>
    )
  }

  if (isLoading || !listing) {
    return (
      <div className="mx-auto grid max-w-6xl gap-12 px-5 py-12 lg:grid-cols-2">
        <Skeleton className="aspect-[4/3] w-full rounded-md" />
        <div className="space-y-4">
          <Skeleton className="h-8 w-3/4" />
          <Skeleton className="h-6 w-32" />
          <Skeleton className="h-32 w-full" />
        </div>
      </div>
    )
  }

  const isOwner = Boolean(me && listing.seller && me.id === listing.seller.id)

  return (
    <div className="mx-auto max-w-6xl px-5 py-10">
      <nav className="label-caps mb-8 text-muted-foreground">
        <Link href="/listings" className="hover:text-primary">
          Listings
        </Link>
        <span className="mx-2 text-border">/</span>
        {listing.category ? (
          <Link
            href={`/listings?category=${listing.category.slug}`}
            className="hover:text-primary"
          >
            {listing.category.name}
          </Link>
        ) : (
          "Uncategorised"
        )}
      </nav>

      <div className="grid gap-12 lg:grid-cols-2">
        <div className="lg:sticky lg:top-24 lg:self-start">
          <Gallery images={listing.images} title={listing.title} />
        </div>

        <div>
          <div className="flex items-center gap-2">
            <span className="label-caps text-muted-foreground">
              {CONDITION_LABELS[listing.condition]}
            </span>
            {listing.status !== "AVAILABLE" ? (
              <StatusBadge status={listing.status} />
            ) : null}
          </div>

          <h1 className="mt-3 font-display text-4xl leading-tight">
            {listing.title}
          </h1>

          <p className="numeric mt-4 text-3xl">{formatPrice(listing.price)}</p>

          <div className="mt-6 flex flex-wrap gap-3">
            {isOwner ? (
              <Button asChild size="lg">
                <Link href={`/listings/${listing.id}/edit`}>
                  <Pencil className="size-4" />
                  Edit listing
                </Link>
              </Button>
            ) : (
              <Button
                size="lg"
                disabled={startChat.isPending || listing.status === "SOLD"}
                onClick={() => {
                  if (!me) {
                    router.push(`/login?next=/listings/${listing.id}`)
                    return
                  }
                  startChat.mutate({ listingId: listing.id })
                }}
              >
                <MessageSquare className="size-4" />
                {listing.status === "SOLD" ? "Already sold" : "Message seller"}
              </Button>
            )}

            {!isOwner ? (
              <FavoriteButton
                listingId={listing.id}
                withLabel
                className="px-4"
              />
            ) : null}
          </div>

          <div className="mt-10 border-t border-border pt-6">
            <h2 className="label-caps text-muted-foreground">Description</h2>
            <p className="mt-3 text-[0.95rem] leading-relaxed whitespace-pre-wrap">
              {listing.description}
            </p>
          </div>

          <dl className="mt-8 grid grid-cols-2 gap-y-4 border-t border-border pt-6 text-sm">
            <dt className="label-caps text-muted-foreground">Posted</dt>
            <dd>
              {formatDistanceToNow(listing.createdAt, { addSuffix: true })}
            </dd>

            {listing.location ? (
              <>
                <dt className="label-caps text-muted-foreground">Pickup</dt>
                <dd className="inline-flex items-center gap-1.5">
                  <MapPin className="size-3.5 text-muted-foreground" />
                  {listing.location}
                </dd>
              </>
            ) : null}
          </dl>

          {listing.seller ? (
            <div className="mt-8 rounded-md border border-border bg-card p-5">
              <h2 className="label-caps text-muted-foreground">Seller</h2>
              <div className="mt-4 flex items-center gap-3">
                <Avatar className="size-11">
                  <AvatarImage src={listing.seller.image ?? undefined} alt="" />
                  <AvatarFallback>{listing.seller.name[0]}</AvatarFallback>
                </Avatar>
                <div className="min-w-0">
                  <Link
                    href={`/profile/${listing.seller.id}`}
                    className="block truncate font-medium hover:text-primary"
                  >
                    {listing.seller.name}
                  </Link>
                  <p className="truncate text-xs text-muted-foreground">
                    {listing.seller.campus ?? "Campus not set"} · joined{" "}
                    {formatDistanceToNow(listing.seller.createdAt, {
                      addSuffix: true,
                    })}
                  </p>
                </div>
              </div>
            </div>
          ) : null}
        </div>
      </div>
    </div>
  )
}
