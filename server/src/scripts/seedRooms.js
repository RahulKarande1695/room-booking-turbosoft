import "dotenv/config";
import mongoose from "mongoose";
import { Room } from "../models/models.js";

await mongoose.connect(process.env.MONGO_URI);
await Room.deleteMany();
await Room.insertMany([
  { name: "Everest", capacity: 12, location: "Floor 1" },
  { name: "Kanchenjunga", capacity: 8, location: "Floor 1" },
  { name: "Sahyadri", capacity: 6, location: "Floor 2" },
  { name: "Rajgad", capacity: 4, location: "Floor 2" },
  { name: "Lohagad", capacity: 20, location: "Floor 3" },
]);
console.log("5 rooms seeded");
await mongoose.disconnect();