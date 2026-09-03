/**
 * MongoDB client (server-only).
 *
 * Used for OTP storage when DATABASE_URL (Neon) is not set. Works on Vercel with
 * MongoDB Atlas (mongodb+srv://...).
 *
 * Env:
 *   MONGODB_URL      Atlas or local connection string
 *   MONGODB_DB_NAME  Database name (defaults to demo_db)
 */
import { MongoClient, type Collection, type Db } from "mongodb"

const COLLECTION = "email_otps"

let cachedClient: MongoClient | null = null
let cachedDb: Db | null = null
let indexesEnsured = false

function getMongoUrl(): string {
  const url = process.env.MONGODB_URL?.trim()
  if (!url) {
    throw new Error("MongoDB is not configured (set MONGODB_URL)")
  }
  return url
}

function getDbName(): string {
  return process.env.MONGODB_DB_NAME?.trim() || "demo_db"
}

async function getDb(): Promise<Db> {
  if (cachedDb) return cachedDb
  const url = getMongoUrl()
  if (!cachedClient) {
    cachedClient = new MongoClient(url)
    await cachedClient.connect()
  }
  cachedDb = cachedClient.db(getDbName())
  return cachedDb
}

/** Return the email_otps collection, ensuring indexes once per process. */
export async function getEmailOtpsCollection(): Promise<Collection> {
  const db = await getDb()
  const collection = db.collection(COLLECTION)
  if (!indexesEnsured) {
    await collection.createIndex({ email: 1 }, { unique: true })
    await collection.createIndex({ expires_at: 1 })
    indexesEnsured = true
  }
  return collection
}
