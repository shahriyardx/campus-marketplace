import { TRPCError } from "@trpc/server"
import type { Types } from "mongoose"
import { z } from "zod"
import { idSchema, messageInputSchema } from "@/lib/schemas"
import {
  type ConversationDTO,
  toListingDTO,
  toMessageDTO,
  toPublicUserDTO,
} from "@/lib/serialize"
import { Conversation, Listing, Message } from "@/models"
import { createTRPCRouter, protectedProcedure } from "../init"

const USER_FIELDS = "name image campus bio createdAt"

/** Loads a conversation and refuses unless the caller is the buyer or the seller. */
async function requireMembership(
  conversationId: string,
  userId: Types.ObjectId,
) {
  const conversation = await Conversation.findOne({
    _id: conversationId,
    // Without this filter anyone could read a thread by guessing its id.
    $or: [{ buyer: userId }, { seller: userId }],
  })

  if (!conversation) {
    throw new TRPCError({
      code: "NOT_FOUND",
      message: "Conversation not found",
    })
  }
  return conversation
}

export const messageRouter = createTRPCRouter({
  /** Opens the thread for this listing, creating it only if it does not exist. */
  startOrGet: protectedProcedure
    .input(z.object({ listingId: z.string().regex(/^[0-9a-fA-F]{24}$/) }))
    .mutation(async ({ ctx, input }) => {
      const listing = await Listing.findById(input.listingId).select("seller")
      if (!listing) {
        throw new TRPCError({ code: "NOT_FOUND", message: "Listing not found" })
      }
      if (String(listing.seller) === String(ctx.user._id)) {
        throw new TRPCError({
          code: "BAD_REQUEST",
          message: "This is your own listing",
        })
      }

      // The unique index on { listing, buyer } makes concurrent clicks safe.
      const conversation = await Conversation.findOneAndUpdate(
        { listing: listing._id, buyer: ctx.user._id },
        { $setOnInsert: { seller: listing.seller, lastMessageAt: new Date() } },
        { upsert: true, new: true },
      )

      return { id: String(conversation._id) }
    }),

  conversations: protectedProcedure.query(async ({ ctx }) => {
    const me = ctx.user._id

    const conversations = await Conversation.find({
      $or: [{ buyer: me }, { seller: me }],
    })
      .sort({ lastMessageAt: -1 })
      .populate([
        { path: "listing", select: "title price status images" },
        { path: "buyer", select: USER_FIELDS },
        { path: "seller", select: USER_FIELDS },
      ])
      .lean()

    const ids = conversations.map((conversation) => conversation._id)

    // Two aggregates rather than a query per row.
    const [lastMessages, unread] = await Promise.all([
      Message.aggregate<{ _id: unknown; body: string }>([
        { $match: { conversation: { $in: ids } } },
        { $sort: { createdAt: -1 } },
        { $group: { _id: "$conversation", body: { $first: "$body" } } },
      ]),
      Message.aggregate<{ _id: unknown; count: number }>([
        {
          $match: {
            conversation: { $in: ids },
            sender: { $ne: me },
            readAt: null,
          },
        },
        { $group: { _id: "$conversation", count: { $sum: 1 } } },
      ]),
    ])

    const lastByConversation = new Map(
      lastMessages.map((row) => [String(row._id), row.body]),
    )
    const unreadByConversation = new Map(
      unread.map((row) => [String(row._id), row.count]),
    )

    return conversations.map((conversation): ConversationDTO => {
      const key = String(conversation._id)
      const amBuyer = String(conversation.buyer?._id) === String(me)
      const other = amBuyer ? conversation.seller : conversation.buyer
      const listing = conversation.listing
        ? toListingDTO(conversation.listing)
        : null

      return {
        id: key,
        listing: listing
          ? {
              id: listing.id,
              title: listing.title,
              price: listing.price,
              status: listing.status,
              images: listing.images,
            }
          : null,
        otherUser: other ? toPublicUserDTO(other) : null,
        lastMessage: lastByConversation.get(key) ?? null,
        lastMessageAt: conversation.lastMessageAt,
        unreadCount: unreadByConversation.get(key) ?? 0,
      }
    })
  }),

  thread: protectedProcedure.input(idSchema).query(async ({ ctx, input }) => {
    const me = ctx.user._id

    const conversation = await Conversation.findOne({
      _id: input.id,
      $or: [{ buyer: me }, { seller: me }],
    })
      .populate([
        {
          path: "listing",
          populate: [
            { path: "category", select: "name slug icon" },
            { path: "seller", select: USER_FIELDS },
          ],
        },
        { path: "buyer", select: USER_FIELDS },
        { path: "seller", select: USER_FIELDS },
      ])
      .lean()

    if (!conversation) {
      throw new TRPCError({
        code: "NOT_FOUND",
        message: "Conversation not found",
      })
    }

    const messages = await Message.find({ conversation: conversation._id })
      .sort({ createdAt: 1 })
      .lean()

    const amBuyer = String(conversation.buyer?._id) === String(me)
    const other = amBuyer ? conversation.seller : conversation.buyer

    return {
      id: String(conversation._id),
      listing: conversation.listing ? toListingDTO(conversation.listing) : null,
      otherUser: other ? toPublicUserDTO(other) : null,
      meId: String(me),
      messages: messages.map(toMessageDTO),
    }
  }),

  send: protectedProcedure
    .input(messageInputSchema)
    .mutation(async ({ ctx, input }) => {
      const conversation = await requireMembership(
        input.conversationId,
        ctx.user._id,
      )

      const message = await Message.create({
        conversation: conversation._id,
        sender: ctx.user._id,
        body: input.body,
      })

      conversation.lastMessageAt = new Date()
      await conversation.save()

      return toMessageDTO(message)
    }),

  markRead: protectedProcedure
    .input(idSchema)
    .mutation(async ({ ctx, input }) => {
      const conversation = await requireMembership(input.id, ctx.user._id)

      await Message.updateMany(
        {
          conversation: conversation._id,
          sender: { $ne: ctx.user._id },
          readAt: null,
        },
        { $set: { readAt: new Date() } },
      )

      return { ok: true }
    }),

  unreadCount: protectedProcedure.query(async ({ ctx }) => {
    const me = ctx.user._id

    const conversations = await Conversation.find({
      $or: [{ buyer: me }, { seller: me }],
    })
      .select("_id")
      .lean()

    if (!conversations.length) return 0

    return Message.countDocuments({
      conversation: { $in: conversations.map((c) => c._id) },
      sender: { $ne: me },
      readAt: null,
    })
  }),
})
