import dotenv from "dotenv";
import app from "./app.js";
import connectDB from "./config/db.js";
import billRoutes from "./routes/billRoutes.js";
import medicalHistoryRoutes from "./routes/medicalHistoryRoutes.js";
import staffRoutes from "./routes/staffRoutes.js";

dotenv.config();

const PORT = process.env.PORT || 5000;
app.use("/api/bills", billRoutes);
app.use("/api/medical-history", medicalHistoryRoutes);
app.use("/api/staff", staffRoutes);


const startServer = async () => {
  await connectDB();

  app.listen(PORT, () => {
    console.log(`MediCare server is running on port ${PORT}`);
  });
};

startServer();