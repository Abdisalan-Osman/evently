"use server";
import { handleError } from "../utils";
import { connectDB } from "../mongodb";
import User from "../mongodb/models/user.model";
import Event from "../mongodb/models/events.models";
import { revalidatePath } from "next/cache";
import Order from "../mongodb/models/order.models";

///////////////////////////////////////////
////////////////////////////////////////

interface Props {
  id: string;
  first_name: string;
  last_name: string;
  image_url: string;
  email_addresses: { email_address: string }[];
  username: string;
}

export async function createUser({
  id,
  first_name,
  last_name,
  image_url,
  email_addresses,
  username,
}: Props) {
  try {
    await connectDB();
    const user = await User.create({
      clerkId: id,
      firstName: first_name,
      lastName: last_name,
      photo: image_url,
      email: email_addresses[0].email_address,
      username: username,
    });

    return user;
  } catch (error) {
    handleError(error);
  }
}

export async function updateUser({
  id,
  first_name,
  last_name,
  image_url,
  email_addresses,
  username,
}: Props) {
  try {
    await connectDB();
    const user = await User.findByIdAndUpdate(
      { clerkId: id },
      {
        $set: {
          firstName: first_name,
          lastName: last_name,
          photo: image_url,
          email: email_addresses[0].email_address,
          username: username,
        },
      },
      { new: true, upsert: true }
    );

    return user;
  } catch (error) {
    handleError(error);
  }
}

export async function getUserById(userId: string) {
  try {
    await connectDB();

    const user = await User.findById(userId);

    if (!user) throw new Error("User not found");
    return JSON.parse(JSON.stringify(user));
  } catch (error) {
    handleError(error);
  }
}

export async function deleteUser(id: string) {
  try {
    await connectDB();

    const user = await User.findOneAndDelete({ clerkId: id });
    if (!user) {
      throw new Error("User not found");
    }

    // Unlink relationships
    await Promise.all([
      // Update the 'events' collection to remove references to the user
      Event.updateMany(
        { _id: { $in: user.events } },
        { $pull: { organizer: user._id } }
      ),

      // Update the 'orders' collection to remove references to the user
      Order.updateMany({ _id: { $in: user.orders } }, { $unset: { buyer: 1 } }),
    ]);

    // Delete user
    const deletedUser = await User.findByIdAndDelete(user._id);
    revalidatePath("/");

    return deletedUser;
  } catch (error) {
    handleError(error);
  }
}
