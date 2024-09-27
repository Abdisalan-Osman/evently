import mongoose from "mongoose";

// Define the user schema
const userSchema = new mongoose.Schema(
  {
    clerkId: { type: String, required: true, unique: true },
    email: { type: String, required: true },
    username: { type: String, required: true },
    firstName: { type: String, required: true },
    lastName: { type: String, required: true },
    photo: { type: String, required: true },
  },
  { timestamps: true }
);

// Check if the model already exists, otherwise create it
const User = mongoose.models.User || mongoose.model("User", userSchema);

export default User;
