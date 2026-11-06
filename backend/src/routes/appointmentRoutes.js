
import express from "express";
import {
  createAppointment,
  getAppointments,
  updateAppointmentStatus,
  deleteAppointment,
} from "../controllers/appointmentController.js";

import {
  protect,
  authorizeRoles,
} from "../middleware/authMiddleware.js";

const router = express.Router();

// Book a new appointment
router.post(
  "/",
  protect,
  authorizeRoles("admin", "receptionist"),
  createAppointment
);

// Get all appointments
router.get(
  "/",
  protect,
  authorizeRoles("admin", "doctor", "receptionist"),
  getAppointments
);

// Update appointment status
router.patch(
  "/:id/status",
  protect,
  authorizeRoles("admin"),
  updateAppointmentStatus
);

// Delete appointment
router.delete(
  "/:id",
  protect,
  authorizeRoles("admin"),
  deleteAppointment
);

export default router;
