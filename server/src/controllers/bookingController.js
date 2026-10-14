import { Room, Booking, Slot } from "../models/models.js";
import {  SLOT_MS, fail } from "../utils.js";
import { customerExists } from "../zoho/zoho.js";

export const createBooking = async (req, res) => {
  const key = req.get("Idempotency-Key");
  if (!key) throw fail(400, "Idempotency-Key header is required");

  const existing = await Booking.findOne({ idempotencyKey: key });
  if (existing) return res.status(200).json(existing);

  const { customerId, roomId, start, end, purpose } = req.body;
  if (!customerId || !roomId || !start || !end || !purpose)
    throw fail(400, "customerId, roomId, start, end, purpose are required");

  const s = new Date(start);
  const e = new Date(end);
  if (isNaN(s) || isNaN(e) || s >= e) throw fail(400, "invalid start/end");
  if (s % SLOT_MS || e % SLOT_MS) throw fail(400, "times must be on 15-minute boundaries");

  if (!(await Room.exists({ _id: roomId }))) throw fail(404, "room not found");
  if (!(await customerExists(customerId))) throw fail(400, "customer not found in CRM");

  let booking;
  try {
    booking = await Booking.create({ roomId, customerId, start: s, end: e, purpose, idempotencyKey: key });
  } catch (err) {
    if (err.code !== 11000) throw err;
    return res.status(200).json(await Booking.findOne({ idempotencyKey: key }));
  }

  const slots = [];
  for (let t = s.getTime(); t < e.getTime(); t += SLOT_MS) {
    slots.push({ roomId, slotStart: new Date(t), bookingId: booking._id });
  }
  try {
    await Slot.insertMany(slots);
  } catch (err) {
    await Slot.deleteMany({ bookingId: booking._id });
    await Booking.deleteOne({ _id: booking._id });
    if (err.code === 11000) throw fail(409, "room is already booked for that time");
    throw err;
  }

  res.status(201).json(booking);
};

export const listBookings = async (req, res) => {
  res.json(await Booking.find().sort({ start: 1 }));
};