import Product from "../models/Product.js";
import { uploadToCloudinary, deleteFromCloudinary } from "../utils/cloudinaryUpload.js";

// ─── Create Product (Admin) ───────────────────────────────────────────────────
export const createProduct = async (req, res) => {
  const { name, brand, category, description, price, discountPrice, stock, specs, isFeatured } = req.body;

  let images = [];

  if (req.files && req.files.length > 0) {
    for (const file of req.files) {
      const result = await uploadToCloudinary(file.buffer);
      images.push({ url: result.secure_url, publicId: result.public_id });
    }
  }

  const product = await Product.create({
    name, brand, category, description,
    price, discountPrice,
    stock,
    specs: specs ? JSON.parse(specs) : {},
    images,
    isFeatured: isFeatured === "true",
  });

  res.status(201).json({ message: "Product created successfully", product });
};

// ─── Update Product (Admin) ───────────────────────────────────────────────────
export const updateProduct = async (req, res) => {
  const product = await Product.findById(req.params.id);
  if (!product) return res.status(404).json({ message: "Product not found" });

  const { name, brand, category, description, price, discountPrice, stock, specs, isFeatured, isActive } = req.body;

  // Upload new images if provided
  if (req.files && req.files.length > 0) {
    // Delete old images from Cloudinary
    for (const img of product.images) {
      await deleteFromCloudinary(img.publicId);
    }
    let newImages = [];
    for (const file of req.files) {
      const result = await uploadToCloudinary(file.buffer);
      newImages.push({ url: result.secure_url, publicId: result.public_id });
    }
    product.images = newImages;
  }

  if (name !== undefined) product.name = name;
  if (brand !== undefined) product.brand = brand;
  if (category !== undefined) product.category = category;
  if (description !== undefined) product.description = description;
  if (price !== undefined) product.price = price;
  if (discountPrice !== undefined) product.discountPrice = discountPrice;
  if (stock !== undefined) product.stock = stock;
  if (specs !== undefined) product.specs = JSON.parse(specs);
  if (isFeatured !== undefined) product.isFeatured = isFeatured === "true";
  if (isActive !== undefined) product.isActive = isActive;

  await product.save();

  res.status(200).json({ message: "Product updated successfully", product });
};

// ─── Delete Product — Soft Delete (Admin) ────────────────────────────────────
export const deleteProduct = async (req, res) => {
  const product = await Product.findById(req.params.id);
  if (!product) return res.status(404).json({ message: "Product not found" });

  product.isActive = false;
  await product.save();

  res.status(200).json({ message: "Product deactivated successfully" });
};

// ─── Get All Products (with search, filter, pagination) ──────────────────────
export const getAllProducts = async (req, res) => {
  const {
    category,
    search,
    minPrice,
    maxPrice,
    page = 1,
    limit = 12,
    sort = "-createdAt",
    featured,
  } = req.query;

  const query = { isActive: true };

  if (category) query.category = category;
  if (featured === "true") query.isFeatured = true;
  if (minPrice || maxPrice) {
    query.price = {};
    if (minPrice) query.price.$gte = Number(minPrice);
    if (maxPrice) query.price.$lte = Number(maxPrice);
  }
  if (search) {
    query.$text = { $search: search };
  }

  const [products, total] = await Promise.all([
    Product.find(query)
      .sort(sort)
      .skip((page - 1) * limit)
      .limit(Number(limit)),
    Product.countDocuments(query),
  ]);

  res.status(200).json({
    total,
    page: Number(page),
    totalPages: Math.ceil(total / limit),
    products,
  });
};

// ─── Get All Products for Admin (includes inactive) ──────────────────────────
export const getAdminProducts = async (req, res) => {
  const { page = 1, limit = 20 } = req.query;

  const [products, total] = await Promise.all([
    Product.find()
      .sort("-createdAt")
      .skip((page - 1) * limit)
      .limit(Number(limit)),
    Product.countDocuments(),
  ]);

  res.status(200).json({ total, page: Number(page), totalPages: Math.ceil(total / limit), products });
};

// ─── Get Single Product ───────────────────────────────────────────────────────
export const getSingleProduct = async (req, res) => {
  const product = await Product.findById(req.params.id).populate("reviews.user", "name");
  if (!product || !product.isActive) {
    return res.status(404).json({ message: "Product not found" });
  }
  res.status(200).json(product);
};

// ─── Add Review ───────────────────────────────────────────────────────────────
export const addReview = async (req, res) => {
  const { rating, comment } = req.body;

  const product = await Product.findById(req.params.id);
  if (!product) return res.status(404).json({ message: "Product not found" });

  // One review per user
  const alreadyReviewed = product.reviews.find(
    (r) => r.user.toString() === req.user._id.toString()
  );
  if (alreadyReviewed) {
    return res.status(400).json({ message: "You have already reviewed this product" });
  }

  product.reviews.push({
    user: req.user._id,
    name: req.user.name,
    rating: Number(rating),
    comment,
  });

  product.calcAverageRating();
  await product.save();

  res.status(201).json({ message: "Review added successfully" });
};

// ─── Delete Review (Admin or own review) ─────────────────────────────────────
export const deleteReview = async (req, res) => {
  const product = await Product.findById(req.params.id);
  if (!product) return res.status(404).json({ message: "Product not found" });

  const review = product.reviews.id(req.params.reviewId);
  if (!review) return res.status(404).json({ message: "Review not found" });

  if (review.user.toString() !== req.user._id.toString() && req.user.role !== "admin") {
    return res.status(403).json({ message: "Not authorized to delete this review" });
  }

  review.deleteOne();
  product.calcAverageRating();
  await product.save();

  res.status(200).json({ message: "Review deleted" });
};
