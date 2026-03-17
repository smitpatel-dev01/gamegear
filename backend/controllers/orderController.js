import Order from "../models/Order.js";
import Cart from "../models/Cart.js";
import Product from "../models/Product.js";

// ─── Place Order from Cart ────────────────────────────────────────────────────
export const placeOrder = async (req, res) => {
  const { shippingAddress, paymentMethod = "COD" } = req.body;

  const cart = await Cart.findOne({ user: req.user._id }).populate("items.product");
  if (!cart || cart.items.length === 0) {
    return res.status(400).json({ message: "Your cart is empty" });
  }

  let itemsTotal = 0;
  const orderItems = [];

  // Validate stock & build order items with price snapshots
  for (const item of cart.items) {
    const product = await Product.findById(item.product._id);
    if (!product || !product.isActive) {
      return res.status(400).json({ message: `Product "${item.product.name}" is no longer available` });
    }
    if (product.stock < item.quantity) {
      return res.status(400).json({ message: `Only ${product.stock} units of "${product.name}" available` });
    }

    const price = product.discountPrice ?? product.price;
    itemsTotal += price * item.quantity;

    orderItems.push({
      product: product._id,
      name: product.name,
      image: product.images[0]?.url || "",
      price,
      quantity: item.quantity,
    });
  }

  const shippingCost = itemsTotal >= 999 ? 0 : 99; // Free shipping above ₹999
  const totalAmount = itemsTotal + shippingCost;

  // Deduct stock
  for (const item of cart.items) {
    await Product.findByIdAndUpdate(item.product._id, {
      $inc: { stock: -item.quantity },
    });
  }

  // Create order
  const order = await Order.create({
    user: req.user._id,
    items: orderItems,
    shippingAddress,
    paymentMethod,
    itemsTotal,
    shippingCost,
    totalAmount,
  });

  // Clear cart
  cart.items = [];
  await cart.save();

  res.status(201).json({ message: "Order placed successfully", order });
};

// ─── Get My Orders ────────────────────────────────────────────────────────────
export const getMyOrders = async (req, res) => {
  const { page = 1, limit = 10 } = req.query;

  const [orders, total] = await Promise.all([
    Order.find({ user: req.user._id })
      .sort("-createdAt")
      .skip((page - 1) * limit)
      .limit(Number(limit)),
    Order.countDocuments({ user: req.user._id }),
  ]);

  res.status(200).json({ total, page: Number(page), totalPages: Math.ceil(total / limit), orders });
};

// ─── Get Single Order ─────────────────────────────────────────────────────────
export const getOrderById = async (req, res) => {
  const order = await Order.findById(req.params.id).populate("user", "name email");

  if (!order) return res.status(404).json({ message: "Order not found" });

  // Users can only see their own orders; admins see all
  if (order.user._id.toString() !== req.user._id.toString() && req.user.role !== "admin") {
    return res.status(403).json({ message: "Not authorized" });
  }

  res.status(200).json(order);
};

// ─── Cancel Order (User) ──────────────────────────────────────────────────────
export const cancelOrder = async (req, res) => {
  const order = await Order.findById(req.params.id);
  if (!order) return res.status(404).json({ message: "Order not found" });

  if (order.user.toString() !== req.user._id.toString()) {
    return res.status(403).json({ message: "Not authorized" });
  }

  if (!["Pending", "Processing"].includes(order.status)) {
    return res.status(400).json({ message: `Cannot cancel an order that is already ${order.status}` });
  }

  // Restore stock
  for (const item of order.items) {
    await Product.findByIdAndUpdate(item.product, { $inc: { stock: item.quantity } });
  }

  order.status = "Cancelled";
  order.cancelledAt = new Date();
  order.cancelReason = req.body.reason || "Cancelled by user";
  await order.save();

  res.status(200).json({ message: "Order cancelled successfully", order });
};

// ─── Admin: Get All Orders ────────────────────────────────────────────────────
export const getAllOrders = async (req, res) => {
  const { page = 1, limit = 20, status } = req.query;

  const query = {};
  if (status) query.status = status;

  const [orders, total] = await Promise.all([
    Order.find(query)
      .sort("-createdAt")
      .skip((page - 1) * limit)
      .limit(Number(limit))
      .populate("user", "name email"),
    Order.countDocuments(query),
  ]);

  res.status(200).json({ total, page: Number(page), totalPages: Math.ceil(total / limit), orders });
};

// ─── Admin: Update Order Status ───────────────────────────────────────────────
export const updateOrderStatus = async (req, res) => {
  const { status, trackingNumber } = req.body;

  const order = await Order.findById(req.params.id);
  if (!order) return res.status(404).json({ message: "Order not found" });

  if (order.status === "Cancelled") {
    return res.status(400).json({ message: "Cannot update a cancelled order" });
  }

  order.status = status;
  if (status === "Delivered") order.deliveredAt = new Date();
  if (trackingNumber) order.trackingNumber = trackingNumber;

  await order.save();

  res.status(200).json({ message: "Order status updated", order });
};
