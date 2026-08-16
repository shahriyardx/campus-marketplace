import {
  model,
  models,
  Schema,
  type InferSchemaType,
  type Model,
  type Types,
} from "mongoose"

const conversationSchema = new Schema(
  {
    listing: { type: Schema.Types.ObjectId, ref: "Listing", required: true },
    buyer: { type: Schema.Types.ObjectId, ref: "User", required: true },
    seller: { type: Schema.Types.ObjectId, ref: "User", required: true },
    lastMessageAt: { type: Date, default: Date.now },
  },
  { timestamps: true },
)

// One thread per buyer per listing, so "Message seller" is idempotent.
conversationSchema.index({ listing: 1, buyer: 1 }, { unique: true })
conversationSchema.index({ buyer: 1, lastMessageAt: -1 })
conversationSchema.index({ seller: 1, lastMessageAt: -1 })

export type ConversationDoc = InferSchemaType<typeof conversationSchema> & {
  _id: Types.ObjectId
}

export const Conversation =
  (models.Conversation as Model<ConversationDoc>) ??
  model<ConversationDoc>("Conversation", conversationSchema)
