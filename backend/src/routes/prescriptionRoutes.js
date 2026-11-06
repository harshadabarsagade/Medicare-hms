import express from "express";

import {
  createPrescription,
  getPrescriptions,
  getPrescriptionById,
  updatePrescription,
  deletePrescription,
} from "../controllers/prescriptionController.js";

import {
  protect,
  authorizeRoles,
} from "../middleware/authMiddleware.js";

const router = express.Router();

// Create prescription
router.post(
  "/",
  protect,
  authorizeRoles("admin", "doctor"),
  createPrescription
);

// Get all prescriptions
router.get(
  "/",
  protect,
  authorizeRoles("admin", "doctor"),
  getPrescriptions
);

// Get single prescription
router.get(
  "/:id",
  protect,
  authorizeRoles("admin", "doctor"),
  getPrescriptionById
);

// Update prescription
router.patch(
  "/:id",
  protect,
  authorizeRoles("admin", "doctor"),
  updatePrescription
);

// Delete prescription
router.delete(
  "/:id",
  protect,
  authorizeRoles("admin"),
  deletePrescription
);

export default router;