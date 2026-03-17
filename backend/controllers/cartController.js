import Cart from "../models/Cart.js";
import Product from "../models/Product.js";

// ─── Get Cart ─────────────────────────────────────────────────────────────────
export const getCart = async (req, res) => {
  const cart = await Cart.findOne({ user: req.user._id }).populate("items.product");
  if (!cart) return res.status(200).json({ items: [] });
  res.status(200).json(cart);
};

// ─── Add to Cart ──────────────────────────────────────────────────────────────
export const addToCart = async (req, res) => {
  const { productId, quantity = 1 } = req.body;

  const product = await Product.findById(productId);
  if (!product || !product.isActive) {
    return res.status(404).json({ message: "Product not found" });
  }
  if (product.stock < quantity) {
    return res.status(400).json({ message: "Not enough stock available" });
  }

  let cart = await Cart.findOne({ user: req.user._id });

  if (!cart) {
    cart = await Cart.create({ user: req.user._id, items: [{ product: productId, quantity }] });
  } else {
    const itemIndex = cart.items.findIndex((i) => i.product.toString() === productId);
    if (itemIndex > -1) {
      const newQty = cart.items[itemIndex].quantity + quantity;
      if (newQty > product.stock) {
        return res.status(400).json({ message: "Not enough stock available" });
      }
      cart.items[itemIndex].quantity = newQty;
    } else {
      cart.items.push({ product: productId, quantity });
    }
    await cart.save();
  }

  await cart.populate("items.product");
  res.status(200).json({ message: "Added to cart", cart });
};

// ─── Update Item Quantity ─────────────────────────────────────────────────────
export const updateCartItem = async (req, res) => {
  const { quantity } = req.body;
  const { productId } = req.params;

  const cart = await Cart.findOne({ user: req.user._id });
  if (!cart) return res.status(404).json({ message: "Cart not found" });

  const itemIndex = cart.items.findIndex((i) => i.product.toString() === productId);
  if (itemIndex === -1) return res.status(404).json({ message: "Item not in cart" });

  const product = await Product.findById(productId);
  if (product.stock < quantity) {
    return res.status(400).json({ message: "Not enough stock available" });
  }

  cart.items[itemIndex].quantity = quantity;
  await cart.save();
  await cart.populate("items.product");

  res.status(200).json({ message: "Cart updated", cart });
};

// ─── Remove Item from Cart ────────────────────────────────────────────────────
export const removeFromCart = async (req, res) => {
  const { productId } = req.params;

  const cart = await Cart.findOne({ user: req.user._id });
  if (!cart) return res.status(404).json({ message: "Cart not found" });

  cart.items = cart.items.filter((i) => i.product.toString() !== productId);
  await cart.save();
  await cart.populate("items.product");

  res.status(200).json({ message: "Item removed from cart", cart });
};

// ─── Clear Cart ───────────────────────────────────────────────────────────────
export const clearCart = async (req, res) => {
  const cart = await Cart.findOne({ user: req.user._id });
  if (!cart) return res.status(200).json({ message: "Cart is already empty" });

  cart.items = [];
  await cart.save();

  res.status(200).json({ message: "Cart cleared" });
};
