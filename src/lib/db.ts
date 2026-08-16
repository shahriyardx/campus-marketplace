import mongoose from "mongoose"
import { env } from "./env"

type MongooseCache = {
  conn: typeof mongoose | null
  promise: Promise<typeof mongoose> | null
}

// Next's dev server re-evaluates modules on every edit. Without this global cache
// each hot reload would open a brand new connection pool until Mongo refuses more.
const globalForMongoose = globalThis as typeof globalThis & {
  _mongoose?: MongooseCache
}

globalForMongoose._mongoose ??= { conn: null, promise: null }
const cached: MongooseCache = globalForMongoose._mongoose

export async function connectDB() {
  if (cached.conn) return cached.conn

  cached.promise ??= mongoose.connect(env.MONGODB_URI, {
    bufferCommands: false,
  })

  try {
    cached.conn = await cached.promise
  } catch (error) {
    // Reset so the next request retries instead of awaiting a permanently failed promise.
    cached.promise = null
    throw error
  }

  return cached.conn
}
