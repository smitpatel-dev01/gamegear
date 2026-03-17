import express from "express";
import { body } from "express-validator";
import {
  getCart,
  addToCart,
  updateCartItem,
  removeFromCart,
  clearCart,
} from "../controllers/cartController.js";
import { verifyToken } from "../middleware/authMiddleware.js";
import { validate } from "../middleware/validateMiddleware.js";

const router = express.Router();

router.use(verifyToken); // All cart routes require login

router.get("/", getCart);
router.post(
  "/",
  [
    body("productId").notEmpty().withMessage("Product ID is required"),
    body("quantity").optional().isInt({ min: 1 }).withMessage("Quantity must be at least 1"),
  ],
  validate,
  addToCart
);
router.put(
  "/:productId",
  [body("quantity").isInt({ min: 1 }).withMessage("Quantity must be at least 1")],
  validate,
  updateCartItem
);
router.delete("/:productId", removeFromCart);
router.delete("/", clearCart);

export default router;
