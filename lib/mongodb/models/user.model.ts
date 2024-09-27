import mongoose from "mongoose";

// Define the user schema
const userSchema = new mongoose.Schema(
  {
    clerkId: {
      type: String,
      required: [true, "Clerk ID is required"],
      unique: true,
    },
    email: { type: String, required: [true, "Email is required"] },
    username: { type: String, required: [true, "Username is required"] },
    firstName: { type: String, required: [true, "First name is required"] },
    lastName: { type: String, required: [true, "Last name is required"] },
    photo: { type: String, required: [true, "Photo URL is required"] },
  },
  { timestamps: true }
);

// Check if the model already exists, otherwise create it
const User = mongoose.models.User || mongoose.model("User", userSchema);

export default User;
