import { ImageOff } from "lucide-react"
import Image from "next/image"
import Link from "next/link"
import { FavoriteButton } from "@/components/favorite-button"
import { StatusBadge } from "@/components/status-badge"
import { CONDITION_LABELS, formatPrice } from "@/lib/constants"
import type { ListingDTO } from "@/lib/serialize"

export function ListingCard({
  listing,
  showFavorite = true,
}: {
  listing: ListingDTO
  showFavorite?: boolean
}) {
  const cover = listing.images[0]

  return (
    <article className="group relative">
      <Link href={`/listings/${listing.id}`} className="block">
        <div className="relative aspect-[4/3] overflow-hidden rounded-md border border-border bg-muted">
          {cover ? (
            <Image
              src={cover.url}
              alt={listing.title}
              fill
              sizes="(min-width: 1024px) 280px, (min-width: 640px) 45vw, 90vw"
              className="object-cover transition-transform duration-500 group-hover:scale-[1.03]"
            />
          ) : (
            <div className="grid h-full place-items-center text-muted-foreground">
              <ImageOff className="size-6" />
            </div>
          )}

          {listing.status !== "AVAILABLE" ? (
            <StatusBadge
              status={listing.status}
              className="absolute top-2 left-2"
            />
          ) : null}
        </div>

        <div className="mt-3 flex items-start justify-between gap-3">
          <h3 className="line-clamp-2 text-[0.95rem] leading-snug font-medium group-hover:text-primary">
            {listing.title}
          </h3>
          <span className="numeric shrink-0 text-base font-medium">
            {formatPrice(listing.price)}
          </span>
        </div>

        <p className="label-caps mt-2 text-muted-foreground">
          {listing.category?.name ?? "Uncategorised"}
          <span className="mx-1.5 text-border">/</span>
          {CONDITION_LABELS[listing.condition]}
        </p>
      </Link>

      {showFavorite ? (
        <FavoriteButton
          listingId={listing.id}
          className="absolute top-2 right-2 opacity-0 transition-opacity group-hover:opacity-100 focus-visible:opacity-100 aria-pressed:opacity-100"
        />
      ) : null}
    </article>
  )
}

export function ListingGrid({ listings }: { listings: ListingDTO[] }) {
  return (
    <div className="grid grid-cols-2 gap-x-5 gap-y-8 md:grid-cols-3 lg:grid-cols-4">
      {listings.map((listing) => (
        <ListingCard key={listing.id} listing={listing} />
      ))}
    </div>
  )
}
