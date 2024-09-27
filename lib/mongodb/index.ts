import mongoose from "mongoose";

let isConnected = false;

export const connectDB = async () => {
  mongoose.set("strictQuery", true);

  if (!process.env.MONGO_URL) return console.log("MONGODB_URL not found");

  if (isConnected) return console.log("Already connected to MongoDb");

  try {
    await mongoose.connect(process.env.MONGO_URL);

    isConnected = true;
    console.log("Connected to MongoDb");
  } catch (error) {
    console.log(error);
  }
};

// import mongoose from "mongoose";

// let cached = (global as any).mongoose || { conn: null, Promise: null };

// const MONGO_URL = process.env.MONGO_URL;

// export const connectDB = async () => {
//   if (cached.conn) return cached.conn;

//   if (!MONGO_URL) throw new Error("MONGO_URL is missing");

//   cached.Promise =
//     cached.Promise ||
//     mongoose.connect(MONGO_URL, {
//       dbName: "evently",
//       bufferCommands: false,
//     });

//   cached.conn = await cached.Promise;
//   return cached.conn;
// };
