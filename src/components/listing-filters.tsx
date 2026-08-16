"use client"

import { X } from "lucide-react"
import { usePathname, useRouter, useSearchParams } from "next/navigation"
import { useCallback } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import {
  CONDITION_LABELS,
  LISTING_CONDITIONS,
  LISTING_SORTS,
  SORT_LABELS,
} from "@/lib/constants"
import { trpc } from "@/trpc/client"

const ANY = "any"

/**
 * Every filter lives in the URL rather than React state, so a filtered view is
 * shareable and the back button behaves.
 */
export function ListingFilters({ onApplied }: { onApplied?: () => void }) {
  const router = useRouter()
  const pathname = usePathname()
  const searchParams = useSearchParams()

  const { data: categories } = trpc.category.list.useQuery()

  const setParam = useCallback(
    (key: string, value: string | null) => {
      const params = new URLSearchParams(searchParams.toString())
      if (value) params.set(key, value)
      else params.delete(key)
      // Any filter change invalidates the current page number.
      params.delete("page")
      router.push(`${pathname}?${params.toString()}`)
      onApplied?.()
    },
    [onApplied, pathname, router, searchParams],
  )

  const category = searchParams.get("category") ?? ANY
  const condition = searchParams.get("condition") ?? ANY
  const sort = searchParams.get("sort") ?? "newest"
  const status = searchParams.get("status") ?? "AVAILABLE"
  const hasFilters = [...searchParams.keys()].some((key) => key !== "page")

  return (
    <div className="space-y-7">
      <div className="flex items-center justify-between">
        <h2 className="label-caps text-muted-foreground">Refine</h2>
        {hasFilters ? (
          <button
            type="button"
            onClick={() => {
              router.push(pathname)
              onApplied?.()
            }}
            className="inline-flex items-center gap-1 text-xs text-muted-foreground hover:text-primary"
          >
            <X className="size-3" />
            Clear all
          </button>
        ) : null}
      </div>

      <div className="space-y-2">
        <Label>Category</Label>
        <Select
          value={category}
          onValueChange={(value) =>
            setParam("category", value === ANY ? null : value)
          }
        >
          <SelectTrigger className="w-full bg-card">
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value={ANY}>All categories</SelectItem>
            {categories?.map((item) => (
              <SelectItem key={item.slug} value={item.slug}>
                {item.name}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      <div className="space-y-2">
        <Label>Condition</Label>
        <Select
          value={condition}
          onValueChange={(value) =>
            setParam("condition", value === ANY ? null : value)
          }
        >
          <SelectTrigger className="w-full bg-card">
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value={ANY}>Any condition</SelectItem>
            {LISTING_CONDITIONS.map((item) => (
              <SelectItem key={item} value={item}>
                {CONDITION_LABELS[item]}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      <form
        className="space-y-2"
        onSubmit={(event) => {
          event.preventDefault()
          const form = new FormData(event.currentTarget)
          const params = new URLSearchParams(searchParams.toString())
          for (const key of ["min", "max"]) {
            const value = String(form.get(key) ?? "").trim()
            if (value) params.set(key, value)
            else params.delete(key)
          }
          params.delete("page")
          router.push(`${pathname}?${params.toString()}`)
          onApplied?.()
        }}
      >
        <Label>Price range</Label>
        <div className="flex items-center gap-2">
          <Input
            name="min"
            type="number"
            min={0}
            inputMode="numeric"
            placeholder="Min"
            defaultValue={searchParams.get("min") ?? ""}
            className="bg-card"
          />
          <span className="text-muted-foreground">–</span>
          <Input
            name="max"
            type="number"
            min={0}
            inputMode="numeric"
            placeholder="Max"
            defaultValue={searchParams.get("max") ?? ""}
            className="bg-card"
          />
        </div>
        <Button
          type="submit"
          variant="outline"
          size="sm"
          className="w-full bg-card"
        >
          Apply price
        </Button>
      </form>

      <div className="space-y-2">
        <Label>Availability</Label>
        <Select
          value={status}
          onValueChange={(value) => setParam("status", value)}
        >
          <SelectTrigger className="w-full bg-card">
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="AVAILABLE">Available only</SelectItem>
            <SelectItem value="RESERVED">Reserved</SelectItem>
            <SelectItem value="SOLD">Sold</SelectItem>
            <SelectItem value="ANY">Show everything</SelectItem>
          </SelectContent>
        </Select>
      </div>

      <div className="space-y-2">
        <Label>Sort by</Label>
        <Select value={sort} onValueChange={(value) => setParam("sort", value)}>
          <SelectTrigger className="w-full bg-card">
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            {LISTING_SORTS.map((item) => (
              <SelectItem key={item} value={item}>
                {SORT_LABELS[item]}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>
    </div>
  )
}
