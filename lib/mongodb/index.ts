import mongoose from "mongoose";

const MONGO_URL = process.env.MONGO_URL;

if (!MONGO_URL) throw new Error("MONGO_URL is not defined");

// Type assertion to bypass the error
let cached = (global as any).mongoose || { conn: null, promise: null };

if (!cached.promise) {
  cached.promise = mongoose
    .connect(MONGO_URL, {
      dbName: "evently",
      bufferCommands: false,
    })
    .then((mongoose) => mongoose);
}

export const connectDB = async () => {
  if (!cached.conn) {
    cached.conn = await cached.promise;
  }
  (global as any).mongoose = cached; // Cache the mongoose connection globally
  return cached.conn;
};
