import { Document, Schema, model, models } from "mongoose";

export interface IEvent extends Document {
  _id: string;
  title: string;
  description?: string;
  location?: string;
  createdAt: Date;
  imageUrl: string; // Note: There might be a typo in the schema ("imgaeUrl" instead of "imageUrl")
  startDate: Date;
  endDate: Date;
  price?: string;
  isFree: boolean;
  url?: string;
  category: { _id: string; name: string }; // or you could use a reference type if using mongoose for TS
  orgonizer: { _id: string; firstName: string; lastName: string };
}

const eventsSchema = new Schema({
  title: { type: String, required: true, unique: true },
  description: { type: String },
  location: { type: String },
  createdAt: { type: Date, default: Date.now() },
  imageUrl: { type: String, required: true },
  startDate: { type: Date, default: Date.now() },
  endDate: { type: Date, default: Date.now() },
  price: { type: String },
  isFree: { type: Boolean, default: false },
  url: { type: String },
  category: { type: Schema.Types.ObjectId, ref: "Category" },
  orgonizer: { type: Schema.Types.ObjectId, ref: "User" },
});

const Event = models.Event || model("Event", eventsSchema);

export default Event;
