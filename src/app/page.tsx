"use client"

import { ArrowRight, Search } from "lucide-react"
import Link from "next/link"
import { useRouter } from "next/navigation"
import { useState } from "react"
import { CategoryRail } from "@/components/category-rail"
import { ListingGrid } from "@/components/listing-card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Skeleton } from "@/components/ui/skeleton"
import { trpc } from "@/trpc/client"

const STEPS = [
  "Post what you no longer need, with photos and a price.",
  "Buyers filter by category, condition or price to find it.",
  "You settle the details in chat and meet on campus.",
]

export default function HomePage() {
  const router = useRouter()
  const [query, setQuery] = useState("")

  const { data: recent, isLoading } = trpc.listing.list.useQuery({
    sort: "newest",
    page: 1,
    limit: 8,
  })

  return (
    <div className="mx-auto max-w-6xl px-5">
      <section className="grid gap-10 border-b border-border py-9 sm:py-14 lg:grid-cols-12 lg:py-24">
        <div className="lg:col-span-7">
          <p className="label-caps text-primary">Student to student</p>
          {/* text-balance rather than a hardcoded <br>: Poppins is wide, and a
              manual break landed a single word on its own line. */}
          <h1 className="mt-3 max-w-[16ch] font-display text-[1.75rem] leading-[1.15] text-balance sm:mt-4 sm:text-[2.25rem] lg:text-[2.75rem] lg:leading-[1.1]">
            Someone on this campus is already done with it.
          </h1>
          <p className="mt-3 max-w-lg text-sm leading-relaxed text-muted-foreground sm:mt-5 sm:text-[0.975rem]">
            Textbooks, calculators, lab kit, second-hand laptops — whatever your
            course eats through. Nothing is paid for online: you message the
            seller and settle it in person.
          </p>

          <form
            className="mt-5 flex max-w-lg gap-2 sm:mt-8"
            onSubmit={(event) => {
              event.preventDefault()
              const trimmed = query.trim()
              router.push(
                trimmed
                  ? `/listings?q=${encodeURIComponent(trimmed)}`
                  : "/listings",
              )
            }}
          >
            <Input
              value={query}
              onChange={(event) => setQuery(event.target.value)}
              placeholder="Try “organic chemistry” or “fx-991”"
              aria-label="Search listings"
              className="h-11 bg-card"
            />
            <Button type="submit" size="lg" className="h-11 shrink-0">
              <Search className="size-4" />
              Search
            </Button>
          </form>
        </div>

        {/* Hidden on small screens: on mobile this pushed the listing grid a
            full extra viewport down, which is the only thing people came for.
            self-start stops the grid stretching it into a half-empty column. */}
        <aside className="hidden self-start overflow-hidden rounded-md border border-border bg-card lg:col-span-4 lg:col-start-9 lg:block">
          <p className="label-caps border-b border-border px-4 py-3 text-muted-foreground">
            How it works
          </p>

          <ol className="divide-y divide-border">
            {STEPS.map((step, index) => (
              <li key={step} className="grid grid-cols-[2.75rem_1fr]">
                {/* The number sits in its own ruled gutter, like a ledger column. */}
                <span className="numeric border-r border-border py-3.5 text-center text-xs text-primary">
                  {String(index + 1).padStart(2, "0")}
                </span>
                <span className="px-4 py-3.5 text-sm leading-relaxed">
                  {step}
                </span>
              </li>
            ))}
          </ol>

          <p className="border-t border-border bg-background px-4 py-3 text-xs text-muted-foreground">
            No payment is taken online. Cash or transfer, in person.
          </p>
        </aside>
      </section>

      <section className="border-b border-border py-8 sm:py-10">
        <h2 className="label-caps mb-4 text-muted-foreground">
          Browse by category
        </h2>
        <CategoryRail />
      </section>

      <section className="py-9 sm:py-14">
        <div className="mb-6 flex items-end justify-between sm:mb-8">
          <h2 className="font-display text-2xl sm:text-3xl">Recently listed</h2>
          <Link
            href="/listings"
            className="group inline-flex items-center gap-1.5 text-sm text-muted-foreground hover:text-primary"
          >
            All listings
            <ArrowRight className="size-4 transition-transform group-hover:translate-x-0.5" />
          </Link>
        </div>

        {isLoading ? (
          <div className="grid grid-cols-2 gap-x-5 gap-y-8 md:grid-cols-3 lg:grid-cols-4">
            {Array.from({ length: 8 }, (_, index) => index).map((index) => (
              <div key={index} className="space-y-3">
                <Skeleton className="aspect-[4/3] w-full rounded-md" />
                <Skeleton className="h-4 w-3/4" />
                <Skeleton className="h-3 w-1/2" />
              </div>
            ))}
          </div>
        ) : recent?.items.length ? (
          <ListingGrid listings={recent.items} />
        ) : (
          <p className="rounded-md border border-dashed border-border px-6 py-16 text-center text-sm text-muted-foreground">
            Nothing listed yet. Be the first —{" "}
            <Link
              href="/listings/new"
              className="text-primary underline underline-offset-4"
            >
              post an item
            </Link>
            .
          </p>
        )}
      </section>
    </div>
  )
}
