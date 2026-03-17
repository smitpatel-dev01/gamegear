import { createContext, useState, useContext, useEffect } from "react";
import api from "../api/api";
import { useAuth } from "./AuthContext";

const CartContext = createContext();

export function CartProvider({ children }) {
  const [cart, setCart] = useState([]);
  const [cartLoading, setCartLoading] = useState(false);
  const { isLoggedIn } = useAuth();

  useEffect(() => {
    if (isLoggedIn) fetchCart();
    else setCart([]);
  }, [isLoggedIn]);

  const fetchCart = async () => {
    try {
      const res = await api.get("/cart");
      setCart(res.data.items || []);
    } catch {
      setCart([]);
    }
  };

  const addToCart = async (productId, quantity = 1) => {
    if (!isLoggedIn) {
      window.location.href = "/login";
      return { success: false };
    }
    setCartLoading(true);
    try {
      const res = await api.post("/cart", { productId, quantity });
      setCart(res.data.cart.items || []);
      return { success: true };
    } catch (error) {
      return { success: false, message: error?.response?.data?.message || "Failed to add to cart" };
    } finally {
      setCartLoading(false);
    }
  };

  const updateQuantity = async (productId, quantity) => {
    try {
      const res = await api.put(`/cart/${productId}`, { quantity });
      setCart(res.data.cart.items || []);
    } catch (error) {
      console.error("Update quantity failed:", error?.response?.data?.message);
    }
  };

  const removeFromCart = async (productId) => {
    try {
      const res = await api.delete(`/cart/${productId}`);
      setCart(res.data.cart.items || []);
    } catch (error) {
      console.error("Remove from cart failed:", error?.response?.data?.message);
    }
  };

  const clearCart = async () => {
    try {
      await api.delete("/cart");
      setCart([]);
    } catch {
      setCart([]);
    }
  };

  const cartCount = cart.reduce((sum, item) => sum + (item.quantity || 0), 0);

  const cartTotal = cart.reduce((sum, item) => {
    const product = item.product;
    if (!product) return sum;
    const price =
      product.discountPrice != null && product.discountPrice < product.price
        ? product.discountPrice
        : product.price || 0;
    return sum + price * (item.quantity || 0);
  }, 0);

  return (
    <CartContext.Provider value={{ cart, cartCount, cartTotal, cartLoading, fetchCart, addToCart, updateQuantity, removeFromCart, clearCart }}>
      {children}
    </CartContext.Provider>
  );
}

export const useCart = () => useContext(CartContext);