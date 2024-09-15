import { Schema, model, models } from "mongoose";

const userSchema = new Schema({
  clerkId: { type: String, required: true, unique: true },
  firstName: { type: String, required: true },
  LASTName: { type: String, required: true },
  email: { type: String, required: true, unique: true },
  username: { type: String, required: true },
  photo: { type: String, required: true },
});

const User = models.User || model("User", userSchema);

export default User;
