import express from "express";
import {
  createPatient,
  getPatients,
  updatePatient,
  deletePatient,
} from "../controllers/patientController.js";
import { protect, authorizeRoles } from "../middleware/authMiddleware.js";

const router = express.Router();

// Register a new patient
router.post(
  "/",
  protect,
  authorizeRoles("admin", "receptionist"),
  createPatient
);

// Get all patients
router.get(
  "/",
  protect,
  authorizeRoles("admin", "doctor", "receptionist"),
  getPatients
);


// Update patient details
router.put(
  "/:id",
  protect,
  authorizeRoles("admin", "doctor", "receptionist"),
  updatePatient
);


// Delete a patient
router.delete(
  "/:id",
  protect,
  authorizeRoles("admin"),
  deletePatient
);

export default router;
