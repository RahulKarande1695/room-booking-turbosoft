import mongoose from "mongoose";
import { Room, Slot } from "../models/models.js";
import { SLOT_MS, OPEN, CLOSE, fail } from "../utils.js";

export const listRooms = async (req, res) => {
  res.json(await Room.find());
};

export const getAvailability = async (req, res) => {
  const { id } = req.params;
  const { date } = req.query;
  const open = new Date(`${date}T${OPEN}:00Z`);
  const close = new Date(`${date}T${CLOSE}:00Z`);

  if (!mongoose.isValidObjectId(id) || !(await Room.exists({ _id: id })))
    throw fail(404, "room not found");
  if (isNaN(open)) throw fail(400, "date must be YYYY-MM-DD");
  if (!(await Room.exists({ _id: id }))) throw fail(404, "room not found");

  // slots already taken for that day
  const taken = await Slot.find({
    roomId: id,
    slotStart: { $gte: open, $lt: close },
  });
  const takenTimes = new Set(taken.map((s) => s.slotStart.getTime()));

  const free = [];
  const busy = [];
  for (let t = open.getTime(); t < close.getTime(); t += SLOT_MS) {
    const slot = { start: new Date(t), end: new Date(t + SLOT_MS) };
    (takenTimes.has(t) ? busy : free).push(slot);
  }

  res.json({ date, free, busy });
};
