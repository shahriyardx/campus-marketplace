import {
  model,
  models,
  Schema,
  type InferSchemaType,
  type Model,
  type Types,
} from "mongoose"

const favoriteSchema = new Schema(
  {
    user: { type: Schema.Types.ObjectId, ref: "User", required: true },
    listing: { type: Schema.Types.ObjectId, ref: "Listing", required: true },
  },
  { timestamps: true },
)

// Makes the toggle safe against double clicks and concurrent requests.
favoriteSchema.index({ user: 1, listing: 1 }, { unique: true })

export type FavoriteDoc = InferSchemaType<typeof favoriteSchema> & {
  _id: Types.ObjectId
}

export const Favorite =
  (models.Favorite as Model<FavoriteDoc>) ??
  model<FavoriteDoc>("Favorite", favoriteSchema)
