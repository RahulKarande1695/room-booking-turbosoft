import "dotenv/config";
import express from "express";
import { notFound, errorHandler } from "./middleware/errorHandler.js";
import customerRoutes from "./routes/customerRoutes.js";
import roomRoutes from "./routes/roomRoutes.js";
import bookingRoutes from "./routes/bookingRoutes.js";
import connectDB from "./config/db.js";

const app = express();
app.use(express.json());

app.use("/customers", customerRoutes);
app.use("/rooms", roomRoutes);
app.use("/bookings", bookingRoutes);

app.use(notFound);
app.use(errorHandler);

await connectDB();
app.listen(process.env.PORT || 5000, () => console.log("Server running"));