import { Webhook } from "svix";
import { headers } from "next/headers";
import { clerkClient } from "@clerk/nextjs/server";
import { createUser, updateUser, deleteUser } from "@/lib/actions/user.actions";
import { NextResponse } from "next/server";

// Define the expected structure of the Clerk Webhook Event
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
    throw new Error(
      "Please add WEBHOOK_SECRET from Clerk Dashboard to .env or .env.local"
    );
  }

  const headerPayload = headers();
  const svixId = headerPayload.get("svix-id");
  const svixTimestamp = headerPayload.get("svix-timestamp");
  const svixSignature = headerPayload.get("svix-signature");

  if (!svixId || !svixTimestamp || !svixSignature) {
    return NextResponse.json(
      { error: "Missing svix headers" },
      { status: 400 }
    );
  }

  const payload = await req.json();
  const body = JSON.stringify(payload);
  const wh = new Webhook(WEBHOOK_SECRET);

  let event: ClerkWebhookEvent;

  try {
    event = wh.verify(body, {
      "svix-id": svixId,
      "svix-timestamp": svixTimestamp,
      "svix-signature": svixSignature,
    }) as ClerkWebhookEvent; // Casting the event to the ClerkWebhookEvent type
  } catch (error) {
    console.error("Webhook verification failed:", error);
    return NextResponse.json(
      { error: "Webhook verification failed" },
      { status: 400 }
    );
  }

  const { type, data } = event;

  switch (type) {
    case "user.created": {
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
      const updatedUserData = {
        username: data.username,
        firstName: data.first_name,
        lastName: data.last_name,
        photo: data.image_url,
      };

      try {
        const updatedUser = await updateUser(data.id, updatedUserData);
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
      try {
        const deletedUser = await deleteUser(data.id);
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
      return NextResponse.json(
        { message: "Unhandled event type" },
        { status: 200 }
      );
  }
}

// import { NextResponse } from "next/server";
// import { Webhook } from "svix"; // Ensure svix is installed
// import { clerkClient } from "@clerk/nextjs/server"; // Adjust import according to your project structure
// import { createUser, updateUser, deleteUser } from "@/lib/actions/user.actions"; // Adjust this import path as needed
// import { ClerkWebhookEvent } from "@/types"; // Import your defined type

// export async function POST(req: Request) {
//   const WEBHOOK_SECRET = process.env.WEBHOOK_SECRET;

//   if (!WEBHOOK_SECRET) {
//     return NextResponse.json(
//       { error: "WEBHOOK_SECRET is missing" },
//       { status: 500 }
//     );
//   }

//   const wh = new Webhook(WEBHOOK_SECRET);

//   // Retrieve headers
//   const svix_id = req.headers.get("svix-id");
//   const svix_timestamp = req.headers.get("svix-timestamp");
//   const svix_signature = req.headers.get("svix-signature");

//   // Check for missing headers
//   if (!svix_id || !svix_timestamp || !svix_signature) {
//     return NextResponse.json({ error: "No svix headers" }, { status: 400 });
//   }

//   // Get request body
//   const body = await req.json();

//   // Verify the payload
//   let evt: ClerkWebhookEvent;
//   try {
//     evt = wh.verify(JSON.stringify(body), {
//       "svix-id": svix_id,
//       "svix-timestamp": svix_timestamp,
//       "svix-signature": svix_signature,
//     }) as ClerkWebhookEvent; // Type assertion here
//   } catch (err) {
//     console.error("Error verifying webhook:", err);
//     return NextResponse.json({ error: "Verification failed" }, { status: 400 });
//   }

//   // Handle event types with type guard
//   if (!evt || !evt.data) {
//     return NextResponse.json(
//       { error: "Invalid event structure" },
//       { status: 400 }
//     );
//   }

//   switch (evt.type) {
//     case "user.created": {
//       const {
//         id,
//         email_addresses,
//         first_name,
//         last_name,
//         username,
//         image_url,
//       } = evt.data;

//       const user = {
//         clerkId: id,
//         email: email_addresses[0]?.email_address ?? "", // Safely access email address
//         username: username ?? "",
//         firstName: first_name ?? "",
//         lastName: last_name ?? "",
//         photo: image_url ?? "", // Provide a fallback
//       };

//       try {
//         const newUser = await createUser(user);
//         return NextResponse.json(
//           { message: "User created", user: newUser },
//           { status: 200 }
//         );
//       } catch (error) {
//         console.error("Error creating user:", error);
//         return NextResponse.json(
//           { error: "User creation failed" },
//           { status: 500 }
//         );
//       }
//     }
//     case "user.updated": {
//       const { id, image_url, first_name, last_name, username } = evt.data;

//       const userUpdates = {
//         firstName: first_name ?? "",
//         lastName: last_name ?? "",
//         username: username ?? "",
//         photo: image_url ?? "",
//       };

//       try {
//         const updatedUser = await updateUser(id, userUpdates);
//         return NextResponse.json(
//           { message: "User updated", user: updatedUser },
//           { status: 200 }
//         );
//       } catch (error) {
//         console.error("Error updating user:", error);
//         return NextResponse.json(
//           { error: "User update failed" },
//           { status: 500 }
//         );
//       }
//     }
//     case "user.deleted": {
//       const { id } = evt.data;

//       try {
//         const deletedUser = await deleteUser(id);
//         return NextResponse.json(
//           { message: "User deleted", user: deletedUser },
//           { status: 200 }
//         );
//       } catch (error) {
//         console.error("Error deleting user:", error);
//         return NextResponse.json(
//           { error: "User deletion failed" },
//           { status: 500 }
//         );
//       }
//     }
//     default:
//       return NextResponse.json(
//         { message: "Unhandled event type" },
//         { status: 200 }
//       );
//   }
// }
