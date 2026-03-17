import { useState } from "react";
import { useNavigate } from "react-router-dom";
import api from "../api/api";
import { useCart } from "../context/CartContext";

export default function Checkout() {
  const navigate = useNavigate();
  const { cart, cartTotal, fetchCart } = useCart();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [form, setForm] = useState({
    street: "", city: "", state: "", pincode: "", country: "India",
    paymentMethod: "COD",
  });

  const shipping = cartTotal >= 999 ? 0 : 99;
  const grandTotal = cartTotal + shipping;

  const handleChange = (e) => setForm({ ...form, [e.target.name]: e.target.value });

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError("");
    try {
      await api.post("/orders", {
        shippingAddress: {
          street: form.street,
          city: form.city,
          state: form.state,
          pincode: form.pincode,
          country: form.country,
        },
        paymentMethod: form.paymentMethod,
      });
      await fetchCart(); // Backend already cleared cart, just refresh local state
      navigate("/my-orders");
    } catch (err) {
      setError(err?.response?.data?.message || "Order placement failed. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  if (cart.length === 0) {
    navigate("/cart");
    return null;
  }

  return (
    <div className="max-w-5xl mx-auto px-6 lg:px-20 py-10">
      <h1 className="text-3xl font-bold text-white mb-8">Checkout</h1>

      {error && (
        <div className="bg-red-500/10 border border-red-500/20 text-red-400 text-sm px-4 py-3 rounded-lg mb-6">
          {error}
        </div>
      )}

      <div className="grid lg:grid-cols-3 gap-8">
        <form onSubmit={handleSubmit} className="lg:col-span-2 space-y-6">
          <div className="card p-6">
            <h2 className="text-white font-bold text-lg mb-5">📍 Shipping Address</h2>
            <div className="space-y-4">
              <div>
                <label className="text-slate-400 text-sm mb-1.5 block">Street Address</label>
                <input name="street" required value={form.street} onChange={handleChange}
                  placeholder="123, MG Road, Apartment 4B" className="input-field" />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="text-slate-400 text-sm mb-1.5 block">City</label>
                  <input name="city" required value={form.city} onChange={handleChange}
                    placeholder="Surat" className="input-field" />
                </div>
                <div>
                  <label className="text-slate-400 text-sm mb-1.5 block">State</label>
                  <input name="state" required value={form.state} onChange={handleChange}
                    placeholder="Gujarat" className="input-field" />
                </div>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="text-slate-400 text-sm mb-1.5 block">Pincode</label>
                  <input name="pincode" required value={form.pincode} onChange={handleChange}
                    placeholder="395001" className="input-field" />
                </div>
                <div>
                  <label className="text-slate-400 text-sm mb-1.5 block">Country</label>
                  <input name="country" required value={form.country} onChange={handleChange}
                    className="input-field" />
                </div>
              </div>
            </div>
          </div>

          <div className="card p-6">
            <h2 className="text-white font-bold text-lg mb-5">💳 Payment Method</h2>
            <div className="space-y-3">
              {[
                { value: "COD", label: "Cash on Delivery", icon: "💵", desc: "Pay when your order arrives" },
                { value: "Online", label: "Online Payment", icon: "💳", desc: "UPI, Cards, Net Banking" },
              ].map((m) => (
                <label key={m.value} className={`flex items-center gap-4 p-4 rounded-xl border-2 cursor-pointer transition-colors ${
                  form.paymentMethod === m.value ? "border-primary bg-primary/5" : "border-slate-700 hover:border-slate-600"
                }`}>
                  <input type="radio" name="paymentMethod" value={m.value}
                    checked={form.paymentMethod === m.value} onChange={handleChange} className="hidden" />
                  <span className="text-2xl">{m.icon}</span>
                  <div>
                    <p className="text-white font-semibold text-sm">{m.label}</p>
                    <p className="text-slate-400 text-xs">{m.desc}</p>
                  </div>
                  {form.paymentMethod === m.value && (
                    <span className="ml-auto text-primary font-bold">✓</span>
                  )}
                </label>
              ))}
            </div>
          </div>

          <button type="submit" disabled={loading} className="btn-primary w-full py-3.5 text-base disabled:opacity-60">
            {loading ? "Placing Order..." : "Place Order 🎮"}
          </button>
        </form>

        <div className="card p-6 h-fit sticky top-20">
          <h3 className="text-white font-bold mb-4">Order Summary</h3>
          <div className="space-y-3 mb-4 max-h-64 overflow-y-auto">
            {cart.map((item) => {
              const p = item.product;
              const price = p?.discountPrice != null && p?.discountPrice < p?.price
                ? p.discountPrice : p?.price || 0;
              return (
                <div key={p?._id} className="flex gap-3 items-center">
                  <img
                    src={p?.images?.[0]?.url || "https://placehold.co/40x40/111f28/06a8f9?text=GG"}
                    alt=""
                    className="w-10 h-10 rounded-lg object-cover bg-bg-card2 shrink-0"
                  />
                  <div className="flex-1 min-w-0">
                    <p className="text-white text-xs font-medium truncate">{p?.name}</p>
                    <p className="text-slate-400 text-xs">×{item.quantity}</p>
                  </div>
                  <span className="text-primary text-xs font-bold shrink-0">
                    ₹{(price * item.quantity).toLocaleString()}
                  </span>
                </div>
              );
            })}
          </div>
          <div className="border-t border-slate-800 pt-4 space-y-2 text-sm">
            <div className="flex justify-between text-slate-400">
              <span>Subtotal</span>
              <span>₹{cartTotal.toLocaleString()}</span>
            </div>
            <div className="flex justify-between text-slate-400">
              <span>Shipping</span>
              <span className={shipping === 0 ? "text-green-400" : ""}>{shipping === 0 ? "FREE" : `₹${shipping}`}</span>
            </div>
            <div className="flex justify-between text-white font-bold pt-2 border-t border-slate-800">
              <span>Total</span>
              <span className="text-primary text-lg">₹{grandTotal.toLocaleString()}</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}