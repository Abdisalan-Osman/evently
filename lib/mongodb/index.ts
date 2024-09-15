import mongoose from "mongoose";

let cached = (global as any).mongoose || { conn: null, Promise: null };

const MONGO_URL = process.env.MONGO_URL;

export const connectDB = async () => {
  if (cached.conn) return cached.conn;

  if (!MONGO_URL) throw new Error("MONGO_URL is missing");

  cached.Promise =
    cached.Promise ||
    mongoose.connect(MONGO_URL, {
      dbName: "evently",
      bufferCommands: false,
    });

  cached.conn = await cached.Promise;
  return cached.conn;
};
