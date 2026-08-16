import {
  model,
  models,
  Schema,
  type InferSchemaType,
  type Model,
  type Types,
} from "mongoose"

const categorySchema = new Schema(
  {
    name: { type: String, required: true },
    slug: { type: String, required: true, unique: true },
    // lucide-react icon name, resolved in the UI
    icon: { type: String, default: null },
  },
  { timestamps: true },
)

export type CategoryDoc = InferSchemaType<typeof categorySchema> & {
  _id: Types.ObjectId
}

export const Category =
  (models.Category as Model<CategoryDoc>) ??
  model<CategoryDoc>("Category", categorySchema)
