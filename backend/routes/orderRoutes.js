import express from "express";
import { body } from "express-validator";
import {
  placeOrder,
  getMyOrders,
  getOrderById,
  cancelOrder,
  getAllOrders,
  updateOrderStatus,
} from "../controllers/orderController.js";
import { verifyToken, isAdmin } from "../middleware/authMiddleware.js";
import { validate } from "../middleware/validateMiddleware.js";

const router = express.Router();

router.use(verifyToken);

// ⚠️ my-orders aur / PEHLE hone chahiye /:id se
router.get("/my-orders", getMyOrders);
router.get("/", isAdmin, getAllOrders);

router.post(
  "/",
  [
    body("shippingAddress.street").notEmpty().withMessage("Street is required"),
    body("shippingAddress.city").notEmpty().withMessage("City is required"),
    body("shippingAddress.state").notEmpty().withMessage("State is required"),
    body("shippingAddress.pincode").notEmpty().withMessage("Pincode is required"),
    body("paymentMethod").isIn(["COD", "Online"]).withMessage("Invalid payment method"),
  ],
  validate,
  placeOrder
);

router.get("/:id", getOrderById);
router.post("/:id/cancel", cancelOrder);
router.put("/:id/status", isAdmin, updateOrderStatus);

export default router;