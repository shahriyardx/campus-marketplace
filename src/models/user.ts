import {
  model,
  models,
  Schema,
  type InferSchemaType,
  type Model,
  type Types,
} from "mongoose"

const userSchema = new Schema(
  {
    uid: { type: String, required: true, unique: true, index: true },
    email: { type: String, required: true, unique: true },
    name: { type: String, required: true },
    image: { type: String, default: null },
    phone: { type: String, default: null },
    campus: { type: String, default: null },
    bio: { type: String, default: null },
  },
  { timestamps: true },
)

export type UserDoc = InferSchemaType<typeof userSchema> & {
  _id: Types.ObjectId
}

export const User =
  (models.User as Model<UserDoc>) ?? model<UserDoc>("User", userSchema)
