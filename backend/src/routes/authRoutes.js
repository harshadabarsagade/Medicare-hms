import express from "express";
import {
  registerUser,
  loginUser,
  getProfile,
  getAdminDashboard,
} from "../controllers/authController.js";
import {
  protect,
  authorizeRoles,
} from "../middleware/authMiddleware.js";

const router = express.Router();


router.post("/register", registerUser);
router.post("/login", loginUser);
router.get("/profile", protect, getProfile);

router.get(
  "/admin",
  protect,
  authorizeRoles("admin"),
  getAdminDashboard
);

export default router;
