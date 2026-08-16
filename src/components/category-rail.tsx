"use client"

import {
  BookOpen,
  Calculator,
  FlaskConical,
  Laptop,
  type LucideIcon,
  NotebookPen,
  PencilRuler,
  Shapes,
} from "lucide-react"
import Link from "next/link"
import { Skeleton } from "@/components/ui/skeleton"
import { cn } from "@/lib/utils"
import { trpc } from "@/trpc/client"

// Explicit map rather than a dynamic lucide lookup: it keeps the icon set out
// of the bundle's critical path and makes a bad `icon` value in the database
// fail visibly here instead of rendering nothing.
const ICONS: Record<string, LucideIcon> = {
  BookOpen,
  Calculator,
  Laptop,
  FlaskConical,
  PencilRuler,
  NotebookPen,
  Shapes,
}

export function CategoryRail({ activeSlug }: { activeSlug?: string }) {
  const { data: categories, isLoading } = trpc.category.list.useQuery()

  if (isLoading) {
    return (
      <div className="grid grid-cols-2 gap-px overflow-hidden rounded-md border border-border bg-border sm:grid-cols-3 lg:grid-cols-4">
        {Array.from({ length: 8 }, (_, index) => index).map((index) => (
          <Skeleton key={index} className="h-[5.5rem] rounded-none" />
        ))}
      </div>
    )
  }

  return (
    // A one-pixel gap over a border-coloured background draws the dividing
    // rules for free, so the block reads as one ruled index card rather than
    // eight floating boxes.
    <div className="grid grid-cols-2 gap-px overflow-hidden rounded-md border border-border bg-border sm:grid-cols-3 lg:grid-cols-4">
      {categories?.map((category, index) => {
        const Icon = ICONS[category.icon ?? ""] ?? Shapes
        const active = category.slug === activeSlug
        const empty = category.listingCount === 0

        return (
          <Link
            key={category.slug}
            href={`/listings?category=${category.slug}`}
            className={cn(
              "group relative flex h-[5.5rem] flex-col justify-between p-3.5 transition-colors sm:p-4",
              active
                ? "bg-foreground text-background"
                : "bg-card hover:bg-accent/60",
            )}
          >
            <div className="flex items-start justify-between">
              <span
                className={cn(
                  "numeric text-[0.6875rem]",
                  active ? "text-background/60" : "text-muted-foreground",
                )}
              >
                {String(index + 1).padStart(2, "0")}
              </span>
              <Icon
                className={cn(
                  "size-[1.15rem] transition-colors",
                  active
                    ? "text-background"
                    : "text-muted-foreground group-hover:text-primary",
                )}
                strokeWidth={1.5}
              />
            </div>

            <div>
              <p className="truncate text-sm leading-tight font-medium">
                {category.name}
              </p>
              <p
                className={cn(
                  "numeric mt-1 text-[0.6875rem]",
                  active
                    ? "text-background/60"
                    : empty
                      ? "text-muted-foreground/60"
                      : "text-muted-foreground",
                )}
              >
                {empty
                  ? "None yet"
                  : `${category.listingCount} ${category.listingCount === 1 ? "item" : "items"}`}
              </p>
            </div>
          </Link>
        )
      })}

      {/* Fills the ragged last row so the grid keeps a clean rectangle. */}
      <Link
        href="/listings"
        className="group flex h-[5.5rem] flex-col justify-between bg-card p-3.5 transition-colors hover:bg-accent/60 sm:p-4"
      >
        <span className="numeric text-[0.6875rem] text-muted-foreground">
          All
        </span>
        <div>
          <p className="text-sm leading-tight font-medium group-hover:text-primary">
            Everything →
          </p>
          <p className="numeric mt-1 text-[0.6875rem] text-muted-foreground">
            Browse the lot
          </p>
        </div>
      </Link>
    </div>
  )
}
