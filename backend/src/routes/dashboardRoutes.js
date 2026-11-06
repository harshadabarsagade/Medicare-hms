import express from "express";
import { getDashboardStats } from "../controllers/dashboardController.js";
import { protect, authorizeRoles } from "../middleware/authMiddleware.js";

const router = express.Router();

router.get(
  "/stats",
  protect,
  authorizeRoles("admin"),
  getDashboardStats
);

export default router;