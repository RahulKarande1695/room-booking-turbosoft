import mongoose from "mongoose";
const { Schema, model } = mongoose;

export const Room = model(
  "Room",
  new Schema({ name: String, capacity: Number, location: String })
);

export const Booking = model(
  "Booking",
  new Schema(
    {
      roomId: { type: Schema.Types.ObjectId, required: true },
      customerId: { type: String, required: true },
      start: Date,
      end: Date,
      purpose: String,
      idempotencyKey: { type: String, unique: true },
    },
    { timestamps: true }
  )
);

// one document per 15-minute slot; the unique index below prevents double booking
const slotSchema = new Schema({
  roomId: Schema.Types.ObjectId,
  slotStart: Date,
  bookingId: Schema.Types.ObjectId,
});
slotSchema.index({ roomId: 1, slotStart: 1 }, { unique: true });
export const Slot = model("Slot", slotSchema);