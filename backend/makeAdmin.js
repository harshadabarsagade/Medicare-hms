import dotenv from "dotenv";
import mongoose from "mongoose";
import User from "./src/models/User.js";

dotenv.config();

const makeAdmin = async () => {
  try {
    await mongoose.connect(process.env.MONGODB_URI, {
      dbName: "test",
    });

    const email = "harshadabarsagade25@navgurukul.org";

    const user = await User.findOneAndUpdate(
      { email },
      { $set: { role: "admin" } },
      { new: true, runValidators: true }
    );

    if (!user) {
      console.log("User not found!");
      return;
    }

    console.log("User role updated:", user.email, user.role);
  } catch (error) {
    console.error("Error:", error.message);
  } finally {
    await mongoose.disconnect();
  }
};

makeAdmin();