import mongoose, { Connection } from "mongoose";

const MONGO_URL = process.env.MONGO_URL;

let cached: { conn: Connection | null; promise: Promise<Connection> | null } = {
  conn: null,
  promise: null,
};

export const connectDB = async (): Promise<Connection> => {
  // Return the cached connection if it exists
  if (cached.conn) return cached.conn;

  if (!MONGO_URL) throw new Error("MONGO_URI is missing");

  // If no promise is cached, create a new connection promise
  if (!cached.promise) {
    cached.promise = mongoose
      .connect(MONGO_URL, {
        dbName: "evently",
        bufferCommands: false, // Optional, can be omitted if you don't need it
      })
      .then((client) => {
        cached.conn = client.connection; // Get the connection from the client
        return cached.conn; // Return the connection
      });
  }

  try {
    // Await the connection promise and cache the connection
    return await cached.promise; // Return the established connection
  } catch (error) {
    console.error("MongoDB connection error:", error);
    throw new Error("Failed to connect to MongoDB");
  }
};
