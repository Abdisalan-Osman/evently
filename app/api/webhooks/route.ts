import { Webhook } from "svix";
import { headers } from "next/headers";
import { WebhookEvent } from "@clerk/nextjs/server";
import { createUser, deleteUser, updateUser } from "@/lib/actions/user.actions";

export async function POST(req: Request) {
  // You can find this in the Clerk Dashboard -> Webhooks -> choose the endpoint
  const WEBHOOK_SECRET = process.env.WEBHOOK_SECRET;

  if (!WEBHOOK_SECRET) {
    throw new Error(
      "Please add WEBHOOK_SECRET from Clerk Dashboard to .env or .env.local"
    );
  }

  // Get the headers
  const headerPayload = headers();
  const svix_id = headerPayload.get("svix-id");
  const svix_timestamp = headerPayload.get("svix-timestamp");
  const svix_signature = headerPayload.get("svix-signature");

  // If there are no headers, error out
  if (!svix_id || !svix_timestamp || !svix_signature) {
    return new Response("Error occured -- no svix headers", {
      status: 400,
    });
  }

  // Get the body
  const payload = await req.json();
  const body = JSON.stringify(payload);

  // Create a new Svix instance with your secret.
  const wh = new Webhook(WEBHOOK_SECRET);

  let evt: WebhookEvent;

  // Verify the payload with the headers
  try {
    evt = wh.verify(body, {
      "svix-id": svix_id,
      "svix-timestamp": svix_timestamp,
      "svix-signature": svix_signature,
    }) as WebhookEvent;
  } catch (err) {
    console.error("Error verifying webhook:", err);
    return new Response("Error occured", {
      status: 400,
    });
  }

  // Do something with the payload
  // For this guide, you simply log the payload to the console
  const { id } = evt?.data;
  const eventType = evt?.type;

  console.log(`Webhook with and ID of ${id} and type of ${eventType}`);
  console.log("Webhook body:", body);

  if (eventType === "user.created") {
    const { id, first_name, last_name, email_addresses, username, image_url } =
      evt?.data;

    try {
      await createUser({
        id,
        first_name: first_name || "",
        last_name: last_name || "",
        image_url,
        email_addresses,
        username: username || "",
      });
      return new Response("user is created", { status: 200 });
    } catch (error) {
      console.log("Error is occored for creating user", error);
      return new Response("Error occurs", { status: 400 });
    }
  }

  if (eventType === "user.updated") {
    const { id, first_name, last_name, email_addresses, username, image_url } =
      evt?.data;

    try {
      await updateUser({
        id,
        first_name: first_name || "",
        last_name: last_name || "",
        image_url,
        email_addresses,
        username: username || "",
      });
      return new Response("user is updated", { status: 200 });
    } catch (error) {
      console.log("Error is occored for updating user", error);
      return new Response("Error occurs", { status: 400 });
    }
  }

  if (eventType === "user.deleted") {
    const { id } = evt?.data;

    try {
      await deleteUser(id || "");
      return new Response("user is deleted", { status: 200 });
    } catch (error) {
      console.log("Error is occored for deleting user", error);
      return new Response("Error occurs", { status: 400 });
    }
  }

  return new Response("", { status: 200 });
}
