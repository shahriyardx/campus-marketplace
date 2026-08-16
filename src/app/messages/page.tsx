"use client"

import { formatDistanceToNow } from "date-fns"
import { ImageOff } from "lucide-react"
import Image from "next/image"
import Link from "next/link"
import { EmptyState } from "@/components/empty-state"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Button } from "@/components/ui/button"
import { Skeleton } from "@/components/ui/skeleton"
import { formatPrice } from "@/lib/constants"
import { trpc } from "@/trpc/client"

export default function MessagesPage() {
  const { data: conversations, isLoading } =
    trpc.message.conversations.useQuery(undefined, { refetchInterval: 5000 })

  return (
    <div className="mx-auto max-w-3xl px-5 py-10">
      <header className="border-b border-border pb-6">
        <h1 className="font-display text-4xl">Messages</h1>
        <p className="mt-2 text-sm text-muted-foreground">
          One thread per item. Agree the price and meeting spot here.
        </p>
      </header>

      {isLoading ? (
        <div className="space-y-3 pt-8">
          {Array.from({ length: 3 }, (_, index) => index).map((index) => (
            <Skeleton key={index} className="h-20 w-full rounded-md" />
          ))}
        </div>
      ) : conversations?.length ? (
        <ul className="divide-y divide-border">
          {conversations.map((conversation) => (
            <li key={conversation.id}>
              <Link
                href={`/messages/${conversation.id}`}
                className="flex items-center gap-4 py-5 transition-colors hover:bg-accent/40"
              >
                <div className="relative size-14 shrink-0 overflow-hidden rounded-sm border border-border bg-muted">
                  {conversation.listing?.images[0] ? (
                    <Image
                      src={
                        conversation.listing.images[0].thumbUrl ??
                        conversation.listing.images[0].url
                      }
                      alt=""
                      fill
                      sizes="56px"
                      className="object-cover"
                    />
                  ) : (
                    <div className="grid h-full place-items-center text-muted-foreground">
                      <ImageOff className="size-4" />
                    </div>
                  )}
                </div>

                <div className="min-w-0 flex-1">
                  <div className="flex items-baseline justify-between gap-3">
                    <p className="line-clamp-1 font-medium">
                      {conversation.listing?.title ?? "Deleted listing"}
                    </p>
                    <span className="label-caps shrink-0 text-muted-foreground">
                      {formatDistanceToNow(conversation.lastMessageAt, {
                        addSuffix: true,
                      })}
                    </span>
                  </div>

                  <div className="mt-1 flex items-center gap-2">
                    <Avatar className="size-5">
                      <AvatarImage
                        src={conversation.otherUser?.image ?? undefined}
                        alt=""
                      />
                      <AvatarFallback className="text-[9px]">
                        {conversation.otherUser?.name[0] ?? "?"}
                      </AvatarFallback>
                    </Avatar>
                    <p className="line-clamp-1 text-sm text-muted-foreground">
                      {conversation.lastMessage ?? "No messages yet"}
                    </p>
                  </div>
                </div>

                <div className="flex shrink-0 flex-col items-end gap-1.5">
                  {conversation.listing ? (
                    <span className="numeric text-sm">
                      {formatPrice(conversation.listing.price)}
                    </span>
                  ) : null}
                  {conversation.unreadCount > 0 ? (
                    <span className="numeric grid min-w-5 place-items-center rounded-full bg-primary px-1.5 py-0.5 text-[10px] text-primary-foreground">
                      {conversation.unreadCount}
                    </span>
                  ) : null}
                </div>
              </Link>
            </li>
          ))}
        </ul>
      ) : (
        <div className="pt-8">
          <EmptyState
            title="No conversations yet"
            description="When you message a seller — or someone messages you about your item — the thread appears here."
            action={
              <Button asChild variant="outline" className="bg-card">
                <Link href="/listings">Find something</Link>
              </Button>
            }
          />
        </div>
      )}
    </div>
  )
}
