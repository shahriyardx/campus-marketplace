"use client"

import { format, isToday } from "date-fns"
import { ArrowLeft, ImageOff, Send } from "lucide-react"
import Image from "next/image"
import Link from "next/link"
import { useParams } from "next/navigation"
import { useEffect, useRef, useState } from "react"
import { toast } from "sonner"
import { StatusBadge } from "@/components/status-badge"
import { Button } from "@/components/ui/button"
import { Skeleton } from "@/components/ui/skeleton"
import { Textarea } from "@/components/ui/textarea"
import { formatPrice } from "@/lib/constants"
import { cn } from "@/lib/utils"
import { trpc } from "@/trpc/client"

function stamp(date: Date) {
  return isToday(date) ? format(date, "HH:mm") : format(date, "d MMM, HH:mm")
}

export default function ThreadPage() {
  const params = useParams<{ id: string }>()
  const utils = trpc.useUtils()
  const [body, setBody] = useState("")
  const bottomRef = useRef<HTMLDivElement>(null)

  const {
    data: thread,
    isLoading,
    error,
  } = trpc.message.thread.useQuery(
    { id: params.id },
    // No websockets: polling keeps this simple and good enough for a chat thread.
    { refetchInterval: 5000 },
  )

  const markRead = trpc.message.markRead.useMutation({
    onSuccess: () => utils.message.unreadCount.invalidate(),
  })

  const send = trpc.message.send.useMutation({
    onSuccess: async () => {
      setBody("")
      await Promise.all([
        utils.message.thread.invalidate({ id: params.id }),
        utils.message.conversations.invalidate(),
      ])
    },
    onError: (mutationError) => toast.error(mutationError.message),
  })

  const messageCount = thread?.messages.length ?? 0

  // Clear the unread badge whenever new messages land while the thread is open.
  useEffect(() => {
    if (messageCount) markRead.mutate({ id: params.id })
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [messageCount, params.id, markRead.mutate])

  // biome-ignore lint/correctness/useExhaustiveDependencies: messageCount is the trigger - scroll down as new messages land
  useEffect(() => {
    bottomRef.current?.scrollIntoView({ block: "end" })
  }, [messageCount])

  if (error) {
    return (
      <div className="mx-auto max-w-3xl px-5 py-24 text-center">
        <h1 className="font-display text-3xl">Conversation not found</h1>
        <Button asChild variant="outline" className="mt-6 bg-card">
          <Link href="/messages">Back to messages</Link>
        </Button>
      </div>
    )
  }

  if (isLoading || !thread) {
    return (
      <div className="mx-auto max-w-3xl space-y-4 px-5 py-10">
        <Skeleton className="h-24 w-full rounded-md" />
        <Skeleton className="h-64 w-full rounded-md" />
      </div>
    )
  }

  const cover = thread.listing?.images[0]

  return (
    <div className="mx-auto flex max-w-3xl flex-col px-5 py-8">
      <Link
        href="/messages"
        className="mb-6 inline-flex items-center gap-1.5 text-sm text-muted-foreground hover:text-primary"
      >
        <ArrowLeft className="size-4" />
        All messages
      </Link>

      <header className="flex items-center gap-4 rounded-md border border-border bg-card p-4">
        <div className="relative size-16 shrink-0 overflow-hidden rounded-sm border border-border bg-muted">
          {cover ? (
            <Image
              src={cover.thumbUrl ?? cover.url}
              alt=""
              fill
              sizes="64px"
              className="object-cover"
            />
          ) : (
            <div className="grid h-full place-items-center text-muted-foreground">
              <ImageOff className="size-4" />
            </div>
          )}
        </div>

        <div className="min-w-0 flex-1">
          <p className="label-caps text-muted-foreground">
            Talking to {thread.otherUser?.name ?? "a former user"}
          </p>
          {thread.listing ? (
            <Link
              href={`/listings/${thread.listing.id}`}
              className="mt-1 line-clamp-1 block font-medium hover:text-primary"
            >
              {thread.listing.title}
            </Link>
          ) : (
            <p className="mt-1 font-medium text-muted-foreground">
              Deleted listing
            </p>
          )}
          {thread.listing ? (
            <p className="numeric mt-1 text-sm">
              {formatPrice(thread.listing.price)}
            </p>
          ) : null}
        </div>

        {thread.listing && thread.listing.status !== "AVAILABLE" ? (
          <StatusBadge status={thread.listing.status} />
        ) : null}
      </header>

      <div className="mt-6 min-h-64 space-y-4">
        {thread.messages.length ? (
          thread.messages.map((message) => {
            const mine = message.senderId === thread.meId
            return (
              <div
                key={message.id}
                className={cn("flex", mine ? "justify-end" : "justify-start")}
              >
                <div className="max-w-[75%]">
                  <div
                    className={cn(
                      "rounded-md border px-3.5 py-2.5 text-sm leading-relaxed whitespace-pre-wrap",
                      mine
                        ? "border-primary/20 bg-primary/10"
                        : "border-border bg-card",
                    )}
                  >
                    {message.body}
                  </div>
                  <p
                    className={cn(
                      "label-caps mt-1.5 text-muted-foreground",
                      mine && "text-right",
                    )}
                  >
                    {stamp(message.createdAt)}
                  </p>
                </div>
              </div>
            )
          })
        ) : (
          <p className="py-12 text-center text-sm text-muted-foreground">
            Say hello. Ask about the condition, the edition, or where to meet.
          </p>
        )}
        <div ref={bottomRef} />
      </div>

      <form
        className="sticky bottom-0 mt-6 flex items-end gap-2 border-t border-border bg-background pt-4"
        onSubmit={(event) => {
          event.preventDefault()
          const trimmed = body.trim()
          if (!trimmed) return
          send.mutate({ conversationId: params.id, body: trimmed })
        }}
      >
        <Textarea
          value={body}
          onChange={(event) => setBody(event.target.value)}
          onKeyDown={(event) => {
            if (event.key === "Enter" && !event.shiftKey) {
              event.preventDefault()
              const trimmed = body.trim()
              if (trimmed)
                send.mutate({ conversationId: params.id, body: trimmed })
            }
          }}
          rows={2}
          placeholder="Write a message… (Enter to send, Shift+Enter for a new line)"
          className="resize-none bg-card"
        />
        <Button
          type="submit"
          size="icon"
          className="size-10"
          disabled={send.isPending}
        >
          <Send className="size-4" />
          <span className="sr-only">Send</span>
        </Button>
      </form>
    </div>
  )
}
