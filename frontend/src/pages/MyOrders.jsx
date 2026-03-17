import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import api from "../api/api";
import { Spinner } from "../components/ProtectedRoute";

const STATUS_COLORS = {
  Pending:    "bg-yellow-500/20 text-yellow-400 border-yellow-500/30",
  Processing: "bg-blue-500/20 text-blue-400 border-blue-500/30",
  Shipped:    "bg-purple-500/20 text-purple-400 border-purple-500/30",
  Delivered:  "bg-green-500/20 text-green-400 border-green-500/30",
  Cancelled:  "bg-red-500/20 text-red-400 border-red-500/30",
};

export default function MyOrders() {
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [cancelling, setCancelling] = useState(null);

  useEffect(() => {
    api.get("/orders/my-orders")
      .then((res) => setOrders(res.data.orders))
      .catch(console.error)
      .finally(() => setLoading(false));
  }, []);

  const handleCancel = async (orderId) => {
    if (!confirm("Cancel this order?")) return;
    setCancelling(orderId);
    try {
      await api.post(`/orders/${orderId}/cancel`, { reason: "Cancelled by user" });
      setOrders((prev) => prev.map((o) => o._id === orderId ? { ...o, status: "Cancelled" } : o));
    } catch (err) {
      alert(err?.response?.data?.message || "Cancel failed");
    } finally {
      setCancelling(null);
    }
  };

  if (loading) return <div className="min-h-screen flex items-center justify-center"><Spinner size="lg" /></div>;

  return (
    <div className="max-w-5xl mx-auto px-6 lg:px-20 py-10">
      <h1 className="text-3xl font-bold text-white mb-2">My Orders</h1>
      <p className="text-slate-400 mb-8">{orders.length} order{orders.length !== 1 && "s"} placed</p>

      {orders.length === 0 ? (
        <div className="text-center py-20">
          <div className="text-6xl mb-4">📦</div>
          <h2 className="text-xl font-bold text-white mb-2">No orders yet</h2>
          <p className="text-slate-400 mb-6">Time to gear up!</p>
          <Link to="/products" className="btn-primary">Start Shopping</Link>
        </div>
      ) : (
        <div className="space-y-4">
          {orders.map((order) => (
            <div key={order._id} className="card p-6">
              {/* Order header */}
              <div className="flex flex-wrap justify-between items-start gap-4 mb-4">
                <div>
                  <p className="text-xs text-slate-500 mb-1">Order ID</p>
                  <p className="text-white font-mono font-semibold text-sm">#{order._id.slice(-8).toUpperCase()}</p>
                </div>
                <div>
                  <p className="text-xs text-slate-500 mb-1">Placed On</p>
                  <p className="text-white text-sm">{new Date(order.createdAt).toLocaleDateString("en-IN", { day: "numeric", month: "short", year: "numeric" })}</p>
                </div>
                <div>
                  <p className="text-xs text-slate-500 mb-1">Total</p>
                  <p className="text-primary font-bold text-lg">₹{order.totalAmount?.toLocaleString()}</p>
                </div>
                <div>
                  <p className="text-xs text-slate-500 mb-1">Payment</p>
                  <p className="text-white text-sm">{order.paymentMethod}</p>
                </div>
                <div className="flex flex-col items-end gap-2">
                  <span className={`badge border ${STATUS_COLORS[order.status] || "bg-slate-700 text-slate-300"}`}>
                    {order.status}
                  </span>
                  {["Pending", "Processing"].includes(order.status) && (
                    <button onClick={() => handleCancel(order._id)} disabled={cancelling === order._id}
                      className="text-xs text-red-400 hover:text-red-300 transition-colors">
                      {cancelling === order._id ? "Cancelling..." : "Cancel Order"}
                    </button>
                  )}
                </div>
              </div>

              {/* Items */}
              <div className="border-t border-slate-800 pt-4 space-y-3">
                {order.items?.map((item, i) => (
                  <div key={i} className="flex items-center gap-3">
                    {item.image && (
                      <img src={item.image} alt={item.name}
                        className="w-12 h-12 rounded-lg object-cover bg-bg-card2 border border-slate-800 shrink-0" />
                    )}
                    <div className="flex-1 min-w-0">
                      <p className="text-white text-sm font-medium truncate">{item.name}</p>
                      <p className="text-slate-400 text-xs">Qty: {item.quantity} × ₹{item.price?.toLocaleString()}</p>
                    </div>
                    <p className="text-white text-sm font-semibold shrink-0">₹{(item.price * item.quantity)?.toLocaleString()}</p>
                  </div>
                ))}
              </div>

              {/* Shipping */}
              <div className="border-t border-slate-800 pt-4 mt-4">
                <p className="text-xs text-slate-500 mb-1">Shipping to</p>
                <p className="text-slate-300 text-sm">
                  {order.shippingAddress?.street}, {order.shippingAddress?.city}, {order.shippingAddress?.state} - {order.shippingAddress?.pincode}
                </p>
                {order.trackingNumber && (
                  <p className="text-primary text-xs mt-1">Tracking: {order.trackingNumber}</p>
                )}
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
