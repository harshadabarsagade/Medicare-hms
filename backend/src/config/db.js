import mongoose from "mongoose";

const connectDB = async () => {
  try {
    await mongoose.connect(process.env.MONGODB_URI, {
      dbName: "test",
    });

    console.log("MongoDB connected successfully!");
    console.log("Connected database:", mongoose.connection.name);
    console.log("Connected cluster:", mongoose.connection.host);
  } catch (error) {
    console.error("MongoDB connection failed:", error.message);
    process.exit(1);
  }
};

export default connectDB;