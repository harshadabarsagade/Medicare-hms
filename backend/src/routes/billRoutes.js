
import express from "express";

import {
  createBill,
  getBills,
  updatePaymentStatus,
} from "../controllers/billController.js";

import {
  protect,
  authorizeRoles,
} from "../middleware/authMiddleware.js";

const router = express.Router();

// Create Bill
router.post(
  "/",
  protect,
  authorizeRoles("admin", "receptionist"),
  createBill
);

// Get All Bills
router.get(
  "/",
  protect,
  authorizeRoles("admin", "receptionist"),
  getBills
);

// Update Payment Status
router.patch(
  "/:id/status",
  protect,
  authorizeRoles("admin", "receptionist"),
  updatePaymentStatus
);

export default router;
