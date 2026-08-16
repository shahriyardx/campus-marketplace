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
  { n: "01", text: "Post what you no longer need, with photos and a price." },
  { n: "02", text: "Buyers find it by course, category or keyword." },
  { n: "03", text: "You agree the details in chat and meet on campus." },
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
          <h1 className="mt-3 font-display text-[2rem] leading-[1.08] tracking-tight sm:mt-4 sm:text-5xl lg:text-6xl lg:leading-[1.05]">
            Someone on this campus
            <br className="hidden sm:block" /> is already done with it.
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
            full extra viewport down, which is the only thing people came for. */}
        <ol className="hidden space-y-6 border-border lg:col-span-4 lg:col-start-9 lg:block lg:border-l lg:pl-10">
          {STEPS.map((step) => (
            <li key={step.n} className="flex gap-4">
              <span className="numeric pt-0.5 text-xs text-primary">
                {step.n}
              </span>
              <span className="text-sm leading-relaxed text-muted-foreground">
                {step.text}
              </span>
            </li>
          ))}
        </ol>
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
