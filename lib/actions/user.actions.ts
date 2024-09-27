"use server"; // Make sure this is appropriate for your Next.js setup

import { handleError } from "../utils"; // Make sure handleError is defined properly
import User from "../mongodb/models/user.model";
import Event from "../mongodb/models/events.models";
import { revalidatePath } from "next/cache"; // Ensure you're using the correct import for revalidation
import Order from "../mongodb/models/order.models";
import { CreateUserParams, UpdateUserParams } from "@/types";
import { connectDB } from "../mongodb";

// Ensure connectDB is called before any database operations
async function ensureDBConnection() {
  try {
    await connectDB(); // Ensure this is awaited to handle connection properly
  } catch (error) {
    throw new Error("Database connection failed");
  }
}

export async function createUser(user: CreateUserParams) {
  try {
    await ensureDBConnection(); // Ensure database is connected

    const newUser = await User.create(user);
    return JSON.parse(JSON.stringify(newUser));
  } catch (error) {
    handleError(error);
    throw error; // Rethrow error after handling it
  }
}

export async function updateUser(clerkId: string, user: UpdateUserParams) {
  try {
    await ensureDBConnection(); // Ensure database is connected

    const updatedUser = await User.findOneAndUpdate({ clerkId }, user, {
      new: true,
    });

    if (!updatedUser) throw new Error("User update failed");
    return JSON.parse(JSON.stringify(updatedUser));
  } catch (error) {
    handleError(error);
    throw error; // Rethrow error after handling it
  }
}

export async function deleteUser(clerkId: string) {
  try {
    await ensureDBConnection(); // Ensure database is connected

    // Find user to delete
    const userToDelete = await User.findOne({ clerkId });

    if (!userToDelete) {
      throw new Error("User not found");
    }

    // Unlink relationships
    await Promise.all([
      // Update the 'events' collection to remove references to the user
      Event.updateMany(
        { _id: { $in: userToDelete.events } },
        { $pull: { organizer: userToDelete._id } }
      ),

      // Update the 'orders' collection to remove references to the user
      Order.updateMany(
        { _id: { $in: userToDelete.orders } },
        { $unset: { buyer: 1 } }
      ),
    ]);

    // Delete user
    const deletedUser = await User.findByIdAndDelete(userToDelete._id);
    await revalidatePath("/"); // Ensure revalidation is awaited

    return deletedUser ? JSON.parse(JSON.stringify(deletedUser)) : null;
  } catch (error) {
    handleError(error);
    throw error; // Rethrow error after handling it
  }
}
