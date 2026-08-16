"use client"

import Link from "next/link"
import { EmptyState } from "@/components/empty-state"
import { ListingGrid } from "@/components/listing-card"
import { Button } from "@/components/ui/button"
import { Skeleton } from "@/components/ui/skeleton"
import { trpc } from "@/trpc/client"

export default function FavoritesPage() {
  const { data: listings, isLoading } = trpc.favorite.list.useQuery()

  return (
    <div className="mx-auto max-w-6xl px-5 py-10">
      <header className="border-b border-border pb-6">
        <h1 className="font-display text-3xl">Saved items</h1>
        <p className="mt-2 text-sm text-muted-foreground">
          Only you can see this list.
        </p>
      </header>

      <div className="pt-8">
        {isLoading ? (
          <div className="grid grid-cols-2 gap-x-5 gap-y-8 md:grid-cols-3 lg:grid-cols-4">
            {Array.from({ length: 4 }, (_, index) => index).map((index) => (
              <Skeleton
                key={index}
                className="aspect-[4/3] w-full rounded-md"
              />
            ))}
          </div>
        ) : listings?.length ? (
          <ListingGrid listings={listings} />
        ) : (
          <EmptyState
            title="Nothing saved yet"
            description="Tap the heart on any listing to keep it here while you decide."
            action={
              <Button asChild variant="outline" className="bg-card">
                <Link href="/listings">Browse listings</Link>
              </Button>
            }
          />
        )}
      </div>
    </div>
  )
}
