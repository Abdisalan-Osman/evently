import { Webhook } from "svix";
import { NextResponse } from "next/server";
import { WebhookEvent, clerkClient } from "@clerk/nextjs/server";
import { createUser, deleteUser, updateUser } from "@/lib/actions/user.actions";

export async function POST(req: Request) {
  const WEBHOOK_SECRET = process.env.WEBHOOK_SECRET;

  if (!WEBHOOK_SECRET) {
    return new Response("WEBHOOK_SECRET not configured", { status: 500 });
  }

  const svix_id = req.headers.get("svix-id");
  const svix_timestamp = req.headers.get("svix-timestamp");
  const svix_signature = req.headers.get("svix-signature");

  if (!svix_id || !svix_timestamp || !svix_signature) {
    return new Response("Missing Svix headers", { status: 400 });
  }

  const payload = await req.json();
  const body = JSON.stringify(payload);

  const wh = new Webhook(WEBHOOK_SECRET);

  let evt: WebhookEvent;

  try {
    evt = wh.verify(body, {
      "svix-id": svix_id,
      "svix-timestamp": svix_timestamp,
      "svix-signature": svix_signature,
    }) as WebhookEvent;
  } catch (err) {
    console.error("Error verifying webhook:", err);
    return new Response("Verification failed", { status: 400 });
  }

  const eventType = evt.type;

  try {
    switch (eventType) {
      case "user.created": {
        const {
          id,
          email_addresses = [],
          image_url,
          first_name,
          last_name,
          username,
        } = evt.data;
        const user = {
          clerkId: id,
          email: email_addresses[0]?.email_address || "",
          username: username || "",
          firstName: first_name || "",
          lastName: last_name || "",
          photo: image_url || "",
        };
        const newUser = await createUser(user);

        if (newUser) {
          await clerkClient.users.updateUserMetadata(id, {
            publicMetadata: {
              userId: newUser._id,
            },
          });
        }

        return NextResponse.json({ message: "OK", user: newUser });
      }

      case "user.updated": {
        const { id, image_url, first_name, last_name, username } = evt.data;
        const user = {
          firstName: first_name || "",
          lastName: last_name || "",
          username: username || "",
          photo: image_url || "",
        };
        const updatedUser = await updateUser(id, user);

        return NextResponse.json({ message: "OK", user: updatedUser });
      }

      case "user.deleted": {
        const { id } = evt.data;
        const deletedUser = await deleteUser(id || "");

        return NextResponse.json({ message: "OK", user: deletedUser });
      }

      default:
        return new Response("Event type not recognized", { status: 400 });
    }
  } catch (error) {
    console.error("Error processing event:", error);
    return new Response("Error processing event", { status: 500 });
  }
}
