"use server";

import { CreateEventParams } from "@/types";
import { handleError } from "../utils";
import { connectDB } from "../mongodb";
import User from "../mongodb/models/user.model";

export async function createEvent({ event, userId, path }: CreateEventParams) {
  try {
    await connectDB();
    const organizer = User.findById(userId);
    if (!organizer) {
      throw new Error("Organizer not found");
    }
  } catch (error) {
    handleError(error);
  }
}
