import { Webhook } from "svix";
import { headers } from "next/headers";
import { clerkClient } from "@clerk/nextjs/server";
import { createUser, updateUser, deleteUser } from "@/lib/actions/user.actions";
import { NextResponse } from "next/server";

interface ClerkWebhookEvent {
  type: string;
  data: {
    id: string;
    email_addresses: { email_address: string }[];
    username: string;
    first_name: string;
    last_name: string;
    image_url: string;
  };
}

export async function POST(req: Request) {
  const WEBHOOK_SECRET = process.env.WEBHOOK_SECRET;

  if (!WEBHOOK_SECRET) {
    console.error("Missing WEBHOOK_SECRET");
    throw new Error(
      "Please add WEBHOOK_SECRET from Clerk Dashboard to .env or .env.local"
    );
  }

  // Headers from the request for signature verification
  const headerPayload = headers();
  const svixId = headerPayload.get("svix-id");
  const svixTimestamp = headerPayload.get("svix-timestamp");
  const svixSignature = headerPayload.get("svix-signature");

  // Error handling if headers are missing
  if (!svixId || !svixTimestamp || !svixSignature) {
    console.error("Missing Svix headers", {
      svixId,
      svixTimestamp,
      svixSignature,
    });
    return NextResponse.json(
      { error: "Missing Svix headers" },
      { status: 400 }
    );
  }

  // Parse the incoming JSON body
  let payload;
  try {
    payload = await req.json();
    console.log("Webhook payload received:", payload);
  } catch (error) {
    console.error("Error parsing webhook payload:", error);
    return NextResponse.json(
      { error: "Invalid JSON payload" },
      { status: 400 }
    );
  }

  const body = JSON.stringify(payload);

  // Create a new Svix instance with your secret
  const wh = new Webhook(WEBHOOK_SECRET);

  let event: ClerkWebhookEvent;
  try {
    // Verify the webhook signature
    event = wh.verify(body, {
      "svix-id": svixId,
      "svix-timestamp": svixTimestamp,
      "svix-signature": svixSignature,
    }) as ClerkWebhookEvent;
    console.log("Verified webhook event:", event);
  } catch (error) {
    console.error("Webhook verification failed:", error);
    return NextResponse.json(
      { error: "Webhook verification failed" },
      { status: 400 }
    );
  }

  // Extract event type and data
  const { type, data } = event;

  switch (type) {
    case "user.created": {
      console.log("Creating user with data:", data);
      const newUser = {
        clerkId: data.id,
        email: data.email_addresses[0].email_address,
        username: data.username,
        firstName: data.first_name,
        lastName: data.last_name,
        photo: data.image_url,
      };

      try {
        const user = await createUser(newUser);
        console.log("User created:", user);
        return NextResponse.json({ message: "User created", user });
      } catch (error) {
        console.error("Failed to create user:", error);
        return NextResponse.json(
          { error: "Failed to create user" },
          { status: 500 }
        );
      }
    }

    case "user.updated": {
      console.log("Updating user with ID:", data.id);
      const updatedUserData = {
        username: data.username,
        firstName: data.first_name,
        lastName: data.last_name,
        photo: data.image_url,
      };

      try {
        const updatedUser = await updateUser(data.id, updatedUserData);
        console.log("User updated:", updatedUser);
        return NextResponse.json({ message: "User updated", updatedUser });
      } catch (error) {
        console.error("Failed to update user:", error);
        return NextResponse.json(
          { error: "Failed to update user" },
          { status: 500 }
        );
      }
    }

    case "user.deleted": {
      console.log("Deleting user with ID:", data.id);
      try {
        const deletedUser = await deleteUser(data.id);
        console.log("User deleted:", deletedUser);
        return NextResponse.json({ message: "User deleted", deletedUser });
      } catch (error) {
        console.error("Failed to delete user:", error);
        return NextResponse.json(
          { error: "Failed to delete user" },
          { status: 500 }
        );
      }
    }

    default:
      console.log("Unhandled event type:", type);
      return NextResponse.json(
        { message: "Unhandled event type" },
        { status: 200 }
      );
  }
}
