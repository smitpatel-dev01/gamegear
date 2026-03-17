import express from "express";
import { body } from "express-validator";
import {
  createProduct,
  updateProduct,
  deleteProduct,
  getAllProducts,
  getAdminProducts,
  getSingleProduct,
  addReview,
  deleteReview,
} from "../controllers/productController.js";
import { verifyToken, isAdmin } from "../middleware/authMiddleware.js";
import { validate } from "../middleware/validateMiddleware.js";
import upload from "../middleware/uploadMiddleware.js";

const router = express.Router();

// Public
router.get("/", getAllProducts);

// ⚠️ /admin/all PEHLE hona chahiye /:id se
router.get("/admin/all", verifyToken, isAdmin, getAdminProducts);

router.post(
  "/",
  verifyToken,
  isAdmin,
  upload.array("images", 5),
  [
    body("name").trim().notEmpty().withMessage("Product name is required"),
    body("brand").trim().notEmpty().withMessage("Brand is required"),
    body("category").isIn(["Mouse", "Keyboard", "Headset", "Monitor", "Controller"]).withMessage("Invalid category"),
    body("price").isFloat({ min: 0 }).withMessage("Price must be a positive number"),
    body("stock").isInt({ min: 0 }).withMessage("Stock must be a non-negative integer"),
  ],
  validate,
  createProduct
);

router.put("/:id", verifyToken, isAdmin, upload.array("images", 5), updateProduct);
router.delete("/:id", verifyToken, isAdmin, deleteProduct);

// ⚠️ /:id routes baad mein
router.get("/:id", getSingleProduct);
router.post(
  "/:id/reviews",
  verifyToken,
  [
    body("rating").isInt({ min: 1, max: 5 }).withMessage("Rating must be between 1 and 5"),
    body("comment").trim().notEmpty().withMessage("Comment is required"),
  ],
  validate,
  addReview
);
router.delete("/:id/reviews/:reviewId", verifyToken, deleteReview);

export default router;