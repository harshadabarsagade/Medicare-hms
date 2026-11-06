import express from "express";

import {
  createMedicalHistory,
  getMedicalHistories,
  getPatientMedicalHistory,
  updateMedicalHistory,
  deleteMedicalHistory,
} from "../controllers/medicalHistoryController.js";

import {
  protect,
  authorizeRoles,
} from "../middleware/authMiddleware.js";

const router = express.Router();

// Create Medical History
router.post(
  "/",
  protect,
  authorizeRoles("admin", "doctor"),
  createMedicalHistory
);

// Get All Medical Histories
router.get(
  "/",
  protect,
  authorizeRoles("admin", "doctor", "receptionist"),
  getMedicalHistories
);

// Get Patient Medical History
router.get(
  "/patient/:patientId",
  protect,
  authorizeRoles("admin", "doctor", "receptionist"),
  getPatientMedicalHistory
);


// Update Medical History
router.put(
  "/:id",
  protect,
  authorizeRoles("admin", "doctor"),
  updateMedicalHistory
);


// Delete Medical History
router.delete(
  "/:id",
  protect,
  authorizeRoles("admin"),
  deleteMedicalHistory
);

export default router;