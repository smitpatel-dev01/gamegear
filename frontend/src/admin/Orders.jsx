import { useEffect, useState } from "react";
import api from "../api/api";
import AdminLayout from "./AdminLayout";
import { Spinner } from "../components/ProtectedRoute";

const STATUSES = ["Pending", "Processing", "Shipped", "Delivered", "Cancelled"];
const STATUS_COLORS = {
  Pending: "bg-yellow-500/20 text-yellow-400 border-yellow-500/30",
  Processing: "bg-blue-500/20 text-blue-400 border-blue-500/30",
  Shipped: "bg-purple-500/20 text-purple-400 border-purple-500/30",
  Delivered: "bg-green-500/20 text-green-400 border-green-500/30",
  Cancelled: "bg-red-500/20 text-red-400 border-red-500/30",
};

export default function AdminOrders() {
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filterStatus, setFilterStatus] = useState("");
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [total, setTotal] = useState(0);
  const [expandedId, setExpandedId] = useState(null);
  const [updatingId, setUpdatingId] = useState(null);

  useEffect(() => { fetchOrders(); }, [page, filterStatus]);

  const fetchOrders = async () => {
    setLoading(true);
    try {
      const params = new URLSearchParams({ page, limit: 15 });
      if (filterStatus) params.set("status", filterStatus);
      const res = await api.get(`/orders?${params}`);
      setOrders(res.data.orders);
      setTotalPages(res.data.totalPages);
      setTotal(res.data.total);
    } catch (err) { console.error(err); }
    finally { setLoading(false); }
  };

  const updateStatus = async (orderId, status) => {
    setUpdatingId(orderId);
    try {
      await api.put(`/orders/${orderId}/status`, { status });
      setOrders((prev) => prev.map((o) => o._id === orderId ? { ...o, status } : o));
    } catch (err) { alert(err?.response?.data?.message || "Update failed"); }
    finally { setUpdatingId(null); }
  };

  return (
    <AdminLayout>
      <div className="p-8">
        <div className="flex items-center justify-between mb-8">
          <div>
            <h1 className="text-3xl font-bold text-white">Orders</h1>
            <p className="text-slate-400 mt-1">{total} total orders</p>
          </div>
        </div>

        {/* Filter tabs */}
        <div className="flex gap-2 mb-6 flex-wrap">
          {["", ...STATUSES].map((s) => (
            <button key={s} onClick={() => { setFilterStatus(s); setPage(1); }}
              className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
                filterStatus === s ? "bg-primary text-white" : "bg-bg-card border border-slate-700 text-slate-400 hover:text-white"
              }`}>
              {s || "All Orders"}
            </button>
          ))}
        </div>

        <div className="card overflow-hidden">
          {loading ? (
            <div className="flex justify-center py-16"><Spinner size="lg" /></div>
          ) : orders.length === 0 ? (
            <div className="text-center py-16 text-slate-400">No orders found</div>
          ) : (
            <>
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead className="bg-primary/5 border-b border-slate-800">
                    <tr className="text-xs uppercase text-slate-400 font-bold tracking-wider">
                      <th className="px-6 py-4 text-left">Order ID</th>
                      <th className="px-6 py-4 text-left">Customer</th>
                      <th className="px-6 py-4 text-left">Amount</th>
                      <th className="px-6 py-4 text-left">Payment</th>
                      <th className="px-6 py-4 text-left">Status</th>
                      <th className="px-6 py-4 text-left">Date</th>
                      <th className="px-6 py-4 text-right">Actions</th>
                    </tr>
                  </thead>
                  <tbody>
                    {orders.map((order) => (
                      <>
                        <tr key={order._id} className="border-b border-slate-800 hover:bg-primary/5 transition-colors">
                          <td className="px-6 py-4">
                            <button onClick={() => setExpandedId(expandedId === order._id ? null : order._id)}
                              className="text-primary font-mono text-sm font-semibold hover:underline">
                              #{order._id.slice(-8).toUpperCase()}
                            </button>
                          </td>
                          <td className="px-6 py-4">
                            <p className="text-white text-sm font-medium">{order.user?.name}</p>
                            <p className="text-slate-500 text-xs">{order.user?.email}</p>
                          </td>
                          <td className="px-6 py-4 text-white font-semibold text-sm">₹{order.totalAmount?.toLocaleString()}</td>
                          <td className="px-6 py-4 text-slate-300 text-sm">{order.paymentMethod}</td>
                          <td className="px-6 py-4">
                            <span className={`badge border ${STATUS_COLORS[order.status]}`}>{order.status}</span>
                          </td>
                          <td className="px-6 py-4 text-slate-400 text-sm">
                            {new Date(order.createdAt).toLocaleDateString("en-IN")}
                          </td>
                          <td className="px-6 py-4 text-right">
                            {order.status !== "Cancelled" && order.status !== "Delivered" && (
                              <select value={order.status} disabled={updatingId === order._id}
                                onChange={(e) => updateStatus(order._id, e.target.value)}
                                className="bg-bg-card2 border border-slate-700 rounded-lg px-2 py-1 text-xs text-white outline-none focus:border-primary">
                                {STATUSES.filter(s => s !== "Cancelled").map(s => (
                                  <option key={s} value={s}>{s}</option>
                                ))}
                              </select>
                            )}
                          </td>
                        </tr>

                        {/* Expanded row */}
                        {expandedId === order._id && (
                          <tr className="bg-primary/5">
                            <td colSpan={7} className="px-6 py-4">
                              <div className="grid md:grid-cols-2 gap-6">
                                <div>
                                  <p className="text-slate-400 text-xs font-bold uppercase mb-2">Order Items</p>
                                  <div className="space-y-2">
                                    {order.items?.map((item, i) => (
                                      <div key={i} className="flex items-center gap-3">
                                        {item.image && <img src={item.image} alt="" className="w-10 h-10 rounded-lg object-cover bg-bg-card" />}
                                        <div className="flex-1">
                                          <p className="text-white text-xs font-medium">{item.name}</p>
                                          <p className="text-slate-400 text-xs">×{item.quantity} @ ₹{item.price?.toLocaleString()}</p>
                                        </div>
                                        <p className="text-primary text-xs font-bold">₹{(item.price * item.quantity)?.toLocaleString()}</p>
                                      </div>
                                    ))}
                                  </div>
                                </div>
                                <div>
                                  <p className="text-slate-400 text-xs font-bold uppercase mb-2">Shipping Address</p>
                                  <p className="text-slate-300 text-sm">
                                    {order.shippingAddress?.street},<br />
                                    {order.shippingAddress?.city}, {order.shippingAddress?.state}<br />
                                    {order.shippingAddress?.pincode} - {order.shippingAddress?.country}
                                  </p>
                                </div>
                              </div>
                            </td>
                          </tr>
                        )}
                      </>
                    ))}
                  </tbody>
                </table>
              </div>

              {totalPages > 1 && (
                <div className="flex justify-between items-center px-6 py-4 border-t border-slate-800">
                  <p className="text-slate-400 text-sm">Page {page} of {totalPages}</p>
                  <div className="flex gap-2">
                    <button onClick={() => setPage(p => p - 1)} disabled={page === 1}
                      className="px-3 py-1.5 border border-slate-700 rounded-lg text-sm text-slate-400 hover:border-primary disabled:opacity-40">← Prev</button>
                    <button onClick={() => setPage(p => p + 1)} disabled={page === totalPages}
                      className="px-3 py-1.5 border border-slate-700 rounded-lg text-sm text-slate-400 hover:border-primary disabled:opacity-40">Next →</button>
                  </div>
                </div>
              )}
            </>
          )}
        </div>
      </div>
    </AdminLayout>
  );
}
