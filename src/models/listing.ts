import {
  model,
  models,
  Schema,
  type InferSchemaType,
  type Model,
  type Types,
} from "mongoose"
import { LISTING_CONDITIONS, LISTING_STATUSES } from "@/lib/constants"

// Images never exist without their listing, so they are embedded rather than
// living in their own collection.
const listingImageSchema = new Schema(
  {
    url: { type: String, required: true },
    thumbUrl: { type: String, default: null },
    // imgbb hands back an HTML delete page, not a REST endpoint. Stored for
    // reference only; we never call it.
    deleteUrl: { type: String, default: null },
  },
  { _id: false },
)

const listingSchema = new Schema(
  {
    title: { type: String, required: true, trim: true },
    description: { type: String, required: true },
    // Whole currency units. Never a float - money and binary fractions do not mix.
    price: { type: Number, required: true, min: 0 },
    condition: {
      type: String,
      enum: LISTING_CONDITIONS,
      default: "GOOD",
      required: true,
    },
    status: {
      type: String,
      enum: LISTING_STATUSES,
      default: "AVAILABLE",
      required: true,
    },
    location: { type: String, default: null },
    category: {
      type: Schema.Types.ObjectId,
      ref: "Category",
      required: true,
    },
    seller: { type: Schema.Types.ObjectId, ref: "User", required: true },
    images: { type: [listingImageSchema], default: [] },
  },
  { timestamps: true },
)

listingSchema.index({ status: 1, createdAt: -1 })
listingSchema.index({ category: 1 })
listingSchema.index({ seller: 1 })

export type ListingDoc = InferSchemaType<typeof listingSchema> & {
  _id: Types.ObjectId
}

export const Listing =
  (models.Listing as Model<ListingDoc>) ??
  model<ListingDoc>("Listing", listingSchema)
