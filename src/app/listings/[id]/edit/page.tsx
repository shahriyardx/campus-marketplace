"use client"

import { useParams, useRouter } from "next/navigation"
import { useEffect } from "react"
import { toast } from "sonner"
import { ListingForm } from "@/components/listing-form"
import { Skeleton } from "@/components/ui/skeleton"
import { trpc } from "@/trpc/client"

export default function EditListingPage() {
  const params = useParams<{ id: string }>()
  const router = useRouter()

  const { data: me } = trpc.user.me.useQuery()
  const { data: listing, isLoading } = trpc.listing.byId.useQuery({
    id: params.id,
  })

  const isOwner = Boolean(me && listing?.seller && me.id === listing.seller.id)

  // The server still refuses a non-owner update; this just avoids showing a
  // form that could never be saved.
  useEffect(() => {
    if (!isLoading && listing && me && !isOwner) {
      toast.error("This listing is not yours")
      router.replace(`/listings/${params.id}`)
    }
  }, [isLoading, listing, me, isOwner, params.id, router])

  if (isLoading || !listing) {
    return (
      <div className="mx-auto max-w-2xl space-y-4 px-5 py-12">
        <Skeleton className="h-10 w-64" />
        <Skeleton className="h-64 w-full" />
      </div>
    )
  }

  if (!isOwner) return null

  return (
    <div className="mx-auto max-w-2xl px-5 py-12">
      <header className="border-b border-border pb-6">
        <p className="label-caps text-primary">Editing</p>
        <h1 className="mt-3 font-display text-3xl">{listing.title}</h1>
      </header>

      <div className="pt-8">
        <ListingForm
          listingId={listing.id}
          defaultValues={{
            title: listing.title,
            description: listing.description,
            price: listing.price,
            condition: listing.condition,
            categoryId: listing.category?.id ?? "",
            location: listing.location ?? "",
            images: listing.images.map((image) => ({
              url: image.url,
              thumbUrl: image.thumbUrl,
            })),
          }}
        />
      </div>
    </div>
  )
}
