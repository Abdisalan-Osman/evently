import { NextResponse } from "next/server";
import { Webhook } from "svix"; // Ensure svix is installed
import { clerkClient } from "@clerk/nextjs/server"; // Adjust import according to your project structure
import { createUser, updateUser, deleteUser } from "@/lib/actions/user.actions"; // Adjust this import path as needed
import { ClerkWebhookEvent } from "@/types"; // Import your defined type

export async function POST(req: Request) {
  const WEBHOOK_SECRET = process.env.WEBHOOK_SECRET;

  if (!WEBHOOK_SECRET) {
    return NextResponse.json(
      { error: "WEBHOOK_SECRET is missing" },
      { status: 500 }
    );
  }

  const wh = new Webhook(WEBHOOK_SECRET);

  // Retrieve headers
  const svix_id = req.headers.get("svix-id");
  const svix_timestamp = req.headers.get("svix-timestamp");
  const svix_signature = req.headers.get("svix-signature");

  // Check for missing headers
  if (!svix_id || !svix_timestamp || !svix_signature) {
    return NextResponse.json({ error: "No svix headers" }, { status: 400 });
  }

  // Get request body
  const body = await req.json();

  // Verify the payload
  let evt: ClerkWebhookEvent;
  try {
    evt = wh.verify(JSON.stringify(body), {
      "svix-id": svix_id,
      "svix-timestamp": svix_timestamp,
      "svix-signature": svix_signature,
    }) as ClerkWebhookEvent; // Type assertion here
  } catch (err) {
    console.error("Error verifying webhook:", err);
    return NextResponse.json({ error: "Verification failed" }, { status: 400 });
  }

  // Handle event types with type guard
  if (!evt || !evt.data) {
    return NextResponse.json(
      { error: "Invalid event structure" },
      { status: 400 }
    );
  }

  switch (evt.type) {
    case "user.created": {
      const {
        id,
        email_addresses,
        first_name,
        last_name,
        username,
        image_url,
      } = evt.data;

      const user = {
        clerkId: id,
        email: email_addresses[0]?.email_address ?? "", // Safely access email address
        username: username ?? "",
        firstName: first_name ?? "",
        lastName: last_name ?? "",
        photo: image_url ?? "", // Provide a fallback
      };

      try {
        const newUser = await createUser(user);
        return NextResponse.json(
          { message: "User created", user: newUser },
          { status: 200 }
        );
      } catch (error) {
        console.error("Error creating user:", error);
        return NextResponse.json(
          { error: "User creation failed" },
          { status: 500 }
        );
      }
    }
    case "user.updated": {
      const { id, image_url, first_name, last_name, username } = evt.data;

      const userUpdates = {
        firstName: first_name ?? "",
        lastName: last_name ?? "",
        username: username ?? "",
        photo: image_url ?? "",
      };

      try {
        const updatedUser = await updateUser(id, userUpdates);
        return NextResponse.json(
          { message: "User updated", user: updatedUser },
          { status: 200 }
        );
      } catch (error) {
        console.error("Error updating user:", error);
        return NextResponse.json(
          { error: "User update failed" },
          { status: 500 }
        );
      }
    }
    case "user.deleted": {
      const { id } = evt.data;

      try {
        const deletedUser = await deleteUser(id);
        return NextResponse.json(
          { message: "User deleted", user: deletedUser },
          { status: 200 }
        );
      } catch (error) {
        console.error("Error deleting user:", error);
        return NextResponse.json(
          { error: "User deletion failed" },
          { status: 500 }
        );
      }
    }
    default:
      return NextResponse.json(
        { message: "Unhandled event type" },
        { status: 200 }
      );
  }
}
