import express from "express";
import {
  createDoctor,
  getDoctors,
  updateDoctor,
  deleteDoctor,

} from "../controllers/doctorController.js";
import {
  protect,
  authorizeRoles,
} from "../middleware/authMiddleware.js";

const router = express.Router();

// Register a new doctor
router.post(
  "/",
  protect,
  authorizeRoles("admin"),
  createDoctor
);

// Get all doctors
router.get(
  "/",
  protect,
  authorizeRoles("admin", "doctor", "receptionist"),
  getDoctors
);


// Update doctor details
router.put(
  "/:id",
  protect,
  authorizeRoles("admin"),
  updateDoctor
);

// Delete a doctor
router.delete(
  "/:id",
  protect,
  authorizeRoles("admin"),
  deleteDoctor
);



export default router;
