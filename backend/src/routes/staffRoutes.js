import express from "express";

import {
    createStaff,
    getStaff,
    updateStaff,
    deleteStaff,
} from "../controllers/staffController.js";

import { protect, authorizeRoles } from "../middleware/authMiddleware.js";

const router = express.Router();

// Add Staff
router.post(
    "/",
    protect,
    authorizeRoles("admin"),
    createStaff
);

// Get All Staff
router.get(
    "/",
    protect,
    authorizeRoles("admin", "receptionist"),
    getStaff
);

// Update Staff
router.put(
    "/:id",
    protect,
    authorizeRoles("admin"),
    updateStaff
);

// Delete Staff
router.delete(
    "/:id",
    protect,
    authorizeRoles("admin"),
    deleteStaff
);

export default router;