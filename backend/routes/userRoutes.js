import express from "express";
import { body } from "express-validator";
import {
  updateProfile,
  changePassword,
  addAddress,
  deleteAddress,
  getAllUsers,
  getUserById,
  toggleUserStatus,
  deleteUser,
  getDashboardStats,
} from "../controllers/userController.js";
import { verifyToken, isAdmin } from "../middleware/authMiddleware.js";
import { validate } from "../middleware/validateMiddleware.js";

const router = express.Router();

router.put(
  "/profile",
  verifyToken,
  [body("name").trim().notEmpty().withMessage("Name is required")],
  validate,
  updateProfile
);

router.put(
  "/change-password",
  verifyToken,
  [
    body("currentPassword").notEmpty().withMessage("Current password is required"),
    body("newPassword").isLength({ min: 6 }).withMessage("New password must be at least 6 characters"),
  ],
  validate,
  changePassword
);

router.post("/address", verifyToken, addAddress);
router.delete("/address/:addressId", verifyToken, deleteAddress);

// ⚠️ dashboard-stats PEHLE hona chahiye /:id se
router.get("/", verifyToken, isAdmin, getAllUsers);
router.get("/dashboard-stats", verifyToken, isAdmin, getDashboardStats);
router.get("/:id", verifyToken, isAdmin, getUserById);
router.patch("/:id/toggle-status", verifyToken, isAdmin, toggleUserStatus);
router.delete("/:id", verifyToken, isAdmin, deleteUser);

export default router;