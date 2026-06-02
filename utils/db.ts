import { MongoClient, Db } from "mongodb";

const MONGODB_URI = process.env.MONGODB_URL || "mongodb://localhost:27017";
const DB_NAME = process.env.DB_NAME || "agent-app";

let cachedDb: Db | null = null;

export const connectToDatabase = async (): Promise<Db> => {
  if (cachedDb) {
    return cachedDb;
  }

  const client = await MongoClient.connect(MONGODB_URI);
  const db = client.db(DB_NAME);
  cachedDb = db;

  return db;
};
