"use client"

import { SlidersHorizontal } from "lucide-react"
import Link from "next/link"
import { usePathname, useRouter, useSearchParams } from "next/navigation"
import { Suspense, useState } from "react"
import { EmptyState } from "@/components/empty-state"
import { ListingGrid } from "@/components/listing-card"
import { ListingFilters } from "@/components/listing-filters"
import { Button } from "@/components/ui/button"
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from "@/components/ui/sheet"
import { Skeleton } from "@/components/ui/skeleton"
import {
  CATEGORY_SLUGS,
  LISTING_CONDITIONS,
  LISTING_SORTS,
  LISTING_STATUSES,
} from "@/lib/constants"
import { trpc } from "@/trpc/client"

const LIMIT = 20

function parseNumber(value: string | null) {
  if (!value) return undefined
  const parsed = Number(value)
  return Number.isFinite(parsed) && parsed >= 0 ? Math.trunc(parsed) : undefined
}

function pickFrom<T extends string>(
  options: readonly T[],
  value: string | null,
) {
  return options.includes(value as T) ? (value as T) : undefined
}

function BrowseListings() {
  const router = useRouter()
  const pathname = usePathname()
  const searchParams = useSearchParams()
  const [filtersOpen, setFiltersOpen] = useState(false)

  const q = searchParams.get("q") ?? undefined
  const page = Math.max(1, parseNumber(searchParams.get("page")) ?? 1)

  const { data, isLoading } = trpc.listing.list.useQuery({
    q,
    // An unrecognised ?category= is dropped rather than sent to the server.
    categorySlug: pickFrom(CATEGORY_SLUGS, searchParams.get("category")),
    condition: pickFrom(LISTING_CONDITIONS, searchParams.get("condition")),
    status:
      pickFrom(
        [...LISTING_STATUSES, "ANY"] as const,
        searchParams.get("status"),
      ) ?? "AVAILABLE",
    minPrice: parseNumber(searchParams.get("min")),
    maxPrice: parseNumber(searchParams.get("max")),
    sort: pickFrom(LISTING_SORTS, searchParams.get("sort")) ?? "newest",
    page,
    limit: LIMIT,
  })

  function goToPage(nextPage: number) {
    const params = new URLSearchParams(searchParams.toString())
    params.set("page", String(nextPage))
    router.push(`${pathname}?${params.toString()}`)
  }

  return (
    <div className="mx-auto max-w-6xl px-5 py-10">
      <div className="flex flex-wrap items-end justify-between gap-4 border-b border-border pb-6">
        <div>
          <h1 className="font-display text-3xl">
            {q ? `“${q}”` : "All listings"}
          </h1>
          <p className="mt-2 text-sm text-muted-foreground">
            {isLoading ? (
              "Loading…"
            ) : (
              <>
                <span className="numeric">{data?.total ?? 0}</span>{" "}
                {data?.total === 1 ? "item" : "items"} found
              </>
            )}
          </p>
        </div>

        <Sheet open={filtersOpen} onOpenChange={setFiltersOpen}>
          <SheetTrigger asChild>
            <Button variant="outline" className="bg-card lg:hidden">
              <SlidersHorizontal className="size-4" />
              Filters
            </Button>
          </SheetTrigger>
          <SheetContent side="left" className="w-80 overflow-y-auto">
            <SheetHeader>
              <SheetTitle className="font-display text-2xl">Filters</SheetTitle>
            </SheetHeader>
            <div className="px-4 pb-8">
              <ListingFilters onApplied={() => setFiltersOpen(false)} />
            </div>
          </SheetContent>
        </Sheet>
      </div>

      <div className="grid gap-10 pt-8 lg:grid-cols-[15rem_1fr]">
        <aside className="hidden lg:block">
          <div className="sticky top-24">
            <ListingFilters />
          </div>
        </aside>

        <div>
          {isLoading ? (
            <div className="grid grid-cols-2 gap-x-5 gap-y-8 md:grid-cols-3">
              {Array.from({ length: 6 }, (_, index) => index).map((index) => (
                <div key={index} className="space-y-3">
                  <Skeleton className="aspect-[4/3] w-full rounded-md" />
                  <Skeleton className="h-4 w-3/4" />
                  <Skeleton className="h-3 w-1/2" />
                </div>
              ))}
            </div>
          ) : data?.items.length ? (
            <>
              <ListingGrid listings={data.items} />

              {data.pages > 1 ? (
                <div className="mt-12 flex items-center justify-between border-t border-border pt-6">
                  <Button
                    variant="outline"
                    className="bg-card"
                    disabled={page <= 1}
                    onClick={() => goToPage(page - 1)}
                  >
                    Previous
                  </Button>
                  <span className="numeric text-sm text-muted-foreground">
                    {page} / {data.pages}
                  </span>
                  <Button
                    variant="outline"
                    className="bg-card"
                    disabled={page >= data.pages}
                    onClick={() => goToPage(page + 1)}
                  >
                    Next
                  </Button>
                </div>
              ) : null}
            </>
          ) : (
            <EmptyState
              title="Nothing matches yet"
              description="Try a broader search, or clear a filter or two. New items get posted every day."
              action={
                <Button asChild variant="outline" className="bg-card">
                  <Link href="/listings">Clear filters</Link>
                </Button>
              }
            />
          )}
        </div>
      </div>
    </div>
  )
}

export default function ListingsPage() {
  return (
    <Suspense fallback={null}>
      <BrowseListings />
    </Suspense>
  )
}
