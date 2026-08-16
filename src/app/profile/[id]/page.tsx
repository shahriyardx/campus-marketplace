"use client"

import { formatDistanceToNow } from "date-fns"
import { MapPin } from "lucide-react"
import Link from "next/link"
import { useParams } from "next/navigation"
import { EmptyState } from "@/components/empty-state"
import { ListingGrid } from "@/components/listing-card"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Button } from "@/components/ui/button"
import { Skeleton } from "@/components/ui/skeleton"
import { trpc } from "@/trpc/client"

export default function ProfilePage() {
  const params = useParams<{ id: string }>()

  const {
    data: profile,
    isLoading,
    error,
  } = trpc.user.publicProfile.useQuery({
    id: params.id,
  })
  const { data: listings } = trpc.listing.list.useQuery({
    sellerId: params.id,
    status: "ANY",
    sort: "newest",
    page: 1,
    limit: 24,
  })

  if (error) {
    return (
      <div className="mx-auto max-w-6xl px-5 py-24 text-center">
        <h1 className="font-display text-3xl">Profile not found</h1>
        <Button asChild variant="outline" className="mt-6 bg-card">
          <Link href="/listings">Back to listings</Link>
        </Button>
      </div>
    )
  }

  if (isLoading || !profile) {
    return (
      <div className="mx-auto max-w-6xl space-y-4 px-5 py-12">
        <Skeleton className="h-20 w-64" />
        <Skeleton className="h-40 w-full" />
      </div>
    )
  }

  return (
    <div className="mx-auto max-w-6xl px-5 py-10">
      <header className="flex flex-wrap items-start gap-6 border-b border-border pb-8">
        <Avatar className="size-20">
          <AvatarImage src={profile.image ?? undefined} alt="" />
          <AvatarFallback className="text-xl">{profile.name[0]}</AvatarFallback>
        </Avatar>

        <div className="min-w-0 flex-1">
          <h1 className="font-display text-3xl">{profile.name}</h1>
          <p className="mt-2 flex flex-wrap items-center gap-x-4 gap-y-1 text-sm text-muted-foreground">
            {profile.campus ? (
              <span className="inline-flex items-center gap-1.5">
                <MapPin className="size-3.5" />
                {profile.campus}
              </span>
            ) : null}
            <span>
              Member{" "}
              {formatDistanceToNow(profile.createdAt, { addSuffix: true })}
            </span>
          </p>
          {profile.bio ? (
            <p className="mt-4 max-w-2xl text-[0.95rem] leading-relaxed">
              {profile.bio}
            </p>
          ) : null}
        </div>
      </header>

      <section className="pt-8">
        <h2 className="mb-6 font-display text-2xl">
          Listings{" "}
          <span className="numeric text-base text-muted-foreground">
            {listings?.total ?? 0}
          </span>
        </h2>

        {listings?.items.length ? (
          <ListingGrid listings={listings.items} />
        ) : (
          <EmptyState
            title="Nothing listed"
            description={`${profile.name} has not posted any items yet.`}
          />
        )}
      </section>
    </div>
  )
}
