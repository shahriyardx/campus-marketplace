"use client"

import {
  Heart,
  LayoutGrid,
  LogOut,
  MessageSquare,
  Plus,
  User,
} from "lucide-react"
import Link from "next/link"
import { useRouter, useSearchParams } from "next/navigation"
import { useState } from "react"
import { toast } from "sonner"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Button } from "@/components/ui/button"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { Input } from "@/components/ui/input"
import { signOutUser } from "@/lib/auth-client"
import { trpc } from "@/trpc/client"

function initials(name: string) {
  return name
    .split(" ")
    .slice(0, 2)
    .map((part) => part[0]?.toUpperCase() ?? "")
    .join("")
}

export function SiteHeader() {
  const router = useRouter()
  const searchParams = useSearchParams()
  const [query, setQuery] = useState(searchParams.get("q") ?? "")

  const utils = trpc.useUtils()
  const { data: me } = trpc.user.me.useQuery()
  const { data: unread } = trpc.message.unreadCount.useQuery(undefined, {
    enabled: Boolean(me),
    // No websockets: a slow poll is enough for an inbox badge.
    refetchInterval: 5000,
  })

  async function handleSignOut() {
    await signOutUser()
    await utils.invalidate()
    toast.success("Signed out")
    router.push("/")
    router.refresh()
  }

  return (
    <header className="sticky top-0 z-40 border-b border-border bg-background/85 backdrop-blur">
      <div className="mx-auto flex h-16 max-w-6xl items-center gap-4 px-5">
        <Link href="/" className="shrink-0 font-display text-2xl leading-none">
          Campus<span className="text-primary">.</span>
        </Link>

        <form
          className="hidden min-w-0 flex-1 md:block"
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
            placeholder="Search textbooks, calculators, lab kits…"
            aria-label="Search listings"
            className="h-9 bg-card"
          />
        </form>

        <nav className="ml-auto flex items-center gap-1">
          <Button
            asChild
            variant="ghost"
            size="sm"
            className="hidden sm:inline-flex"
          >
            <Link href="/listings">
              <LayoutGrid className="size-4" />
              Browse
            </Link>
          </Button>

          {me ? (
            <>
              <Button
                asChild
                variant="ghost"
                size="icon"
                aria-label="Favorites"
              >
                <Link href="/favorites">
                  <Heart className="size-4" />
                </Link>
              </Button>

              <Button
                asChild
                variant="ghost"
                size="icon"
                className="relative"
                aria-label={unread ? `Messages, ${unread} unread` : "Messages"}
              >
                <Link href="/messages">
                  <MessageSquare className="size-4" />
                  {unread ? (
                    <span className="numeric absolute -top-0.5 -right-0.5 grid size-4 place-items-center rounded-full bg-primary text-[10px] text-primary-foreground">
                      {unread > 9 ? "9+" : unread}
                    </span>
                  ) : null}
                </Link>
              </Button>

              <Button asChild size="sm" className="ml-1">
                <Link href="/listings/new">
                  <Plus className="size-4" />
                  Sell
                </Link>
              </Button>

              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <button
                    type="button"
                    className="ml-1 rounded-full outline-offset-2 focus-visible:outline-2 focus-visible:outline-ring"
                  >
                    <Avatar className="size-8">
                      <AvatarImage src={me.image ?? undefined} alt="" />
                      <AvatarFallback className="text-xs">
                        {initials(me.name)}
                      </AvatarFallback>
                    </Avatar>
                  </button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end" className="w-52">
                  <DropdownMenuLabel className="font-normal">
                    <span className="block truncate text-sm">{me.name}</span>
                    <span className="block truncate text-xs text-muted-foreground">
                      {me.email}
                    </span>
                  </DropdownMenuLabel>
                  <DropdownMenuSeparator />
                  <DropdownMenuItem asChild>
                    <Link href="/dashboard">My listings</Link>
                  </DropdownMenuItem>
                  <DropdownMenuItem asChild>
                    <Link href={`/profile/${me.id}`}>Public profile</Link>
                  </DropdownMenuItem>
                  <DropdownMenuItem asChild>
                    <Link href="/settings">Settings</Link>
                  </DropdownMenuItem>
                  <DropdownMenuSeparator />
                  <DropdownMenuItem onSelect={handleSignOut}>
                    <LogOut className="size-4" />
                    Sign out
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
            </>
          ) : (
            <>
              <Button asChild variant="ghost" size="sm">
                <Link href="/login">
                  <User className="size-4" />
                  Sign in
                </Link>
              </Button>
              <Button asChild size="sm">
                <Link href="/register">Get started</Link>
              </Button>
            </>
          )}
        </nav>
      </div>
    </header>
  )
}
