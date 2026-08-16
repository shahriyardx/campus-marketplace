import mongoose from "mongoose"

// Standalone script: run with `bun run db:seed`. It writes to the `categories`
// collection directly so it does not need to import the app's models (which use
// `@/` path aliases that plain node cannot resolve).

const CATEGORIES = [
  { name: "Textbooks", slug: "textbooks", icon: "BookOpen" },
  { name: "Calculators", slug: "calculators", icon: "Calculator" },
  { name: "Electronics", slug: "electronics", icon: "Laptop" },
  { name: "Lab Equipment", slug: "lab-equipment", icon: "FlaskConical" },
  { name: "Stationery", slug: "stationery", icon: "PenLine" },
  { name: "Notes & Guides", slug: "notes-and-guides", icon: "NotebookPen" },
  { name: "Other", slug: "other", icon: "Package" },
]

async function main() {
  const uri = process.env.MONGODB_URI
  if (!uri) throw new Error("MONGODB_URI is not set")

  await mongoose.connect(uri)
  const categories = mongoose.connection.collection("categories")

  await categories.createIndex({ slug: 1 }, { unique: true })

  const now = new Date()
  // Upsert by slug so this script is safe to run repeatedly.
  for (const category of CATEGORIES) {
    await categories.updateOne(
      { slug: category.slug },
      {
        $set: { ...category, updatedAt: now },
        $setOnInsert: { createdAt: now },
      },
      { upsert: true },
    )
  }

  console.log(
    `Seeded ${CATEGORIES.length} categories (${await categories.countDocuments()} total).`,
  )

  await mongoose.disconnect()
}

main().catch((error) => {
  console.error(error)
  process.exit(1)
})
