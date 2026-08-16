import {
  model,
  models,
  Schema,
  type InferSchemaType,
  type Model,
  type Types,
} from "mongoose"

const messageSchema = new Schema(
  {
    conversation: {
      type: Schema.Types.ObjectId,
      ref: "Conversation",
      required: true,
    },
    sender: { type: Schema.Types.ObjectId, ref: "User", required: true },
    body: { type: String, required: true },
    readAt: { type: Date, default: null },
  },
  { timestamps: true },
)

messageSchema.index({ conversation: 1, createdAt: 1 })

export type MessageDoc = InferSchemaType<typeof messageSchema> & {
  _id: Types.ObjectId
}

export const Message =
  (models.Message as Model<MessageDoc>) ??
  model<MessageDoc>("Message", messageSchema)
