import mongoose from "mongoose";

const connectDB = async () => {
  try {
    console.log(process.env.MONGO_URI,"process.env.MONGO_URI")
    const conn = await mongoose.connect(process.env.MONGO_URI);
    console.log(`MongoDB connected: ${conn.connection.host}`);
    await Promise.all(Object.values(mongoose.models).map((m) => m.init()));
  } catch (err) {
    console.error("MongoDB connection failed:", err.message);
    process.exit(1);
  }
};

export default connectDB;