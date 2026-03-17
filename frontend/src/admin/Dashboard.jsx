import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import api from "../api/api";
import AdminLayout from "./AdminLayout";
import { Spinner } from "../components/ProtectedRoute";

const STATUS_COLORS = {
  Pending: "bg-yellow-500/20 text-yellow-400",
  Processing: "bg-blue-500/20 text-blue-400",
  Shipped: "bg-purple-500/20 text-purple-400",
  Delivered: "bg-green-500/20 text-green-400",
  Cancelled: "bg-red-500/20 text-red-400",
};

export default function AdminDashboard() {
  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    api.get("/users/dashboard-stats")
      .then((res) => setStats(res.data))
      .catch(console.error)
      .finally(() => setLoading(false));
  }, []);

  if (loading) return <AdminLayout><div className="flex justify-center items-center h-screen"><Spinner size="lg" /></div></AdminLayout>;

  const statCards = [
    { label: "Total Revenue", value: `₹${stats?.totalRevenue?.toLocaleString() || 0}`, icon: "💰", color: "text-primary" },
    { label: "Total Orders", value: stats?.totalOrders || 0, icon: "🛒", color: "text-purple-400" },
    { label: "Active Customers", value: stats?.totalUsers || 0, icon: "👥", color: "text-green-400" },
  ];

  return (
    <AdminLayout>
      <div className="p-8">
        {/* Header */}
        <div className="flex items-center justify-between mb-8">
          <div>
            <h1 className="text-3xl font-bold text-white">Dashboard Overview</h1>
            <p className="text-slate-400 mt-1">Welcome back! Here's what's happening with GameGear today.</p>
          </div>
        </div>

        {/* Stat Cards */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
          {statCards.map((card) => (
            <div key={card.label} className="card p-6">
              <div className="flex justify-between items-start mb-4">
                <div>
                  <p className="text-slate-400 text-sm">{card.label}</p>
                  <p className={`text-3xl font-bold mt-1 ${card.color}`}>{card.value}</p>
                </div>
                <span className="text-3xl">{card.icon}</span>
              </div>
            </div>
          ))}
        </div>

        {/* Recent Orders */}
        <div className="card overflow-hidden">
          <div className="flex items-center justify-between px-6 py-5 border-b border-slate-800">
            <h2 className="text-white font-bold text-lg">Recent Orders</h2>
            <Link to="/admin/orders" className="text-primary text-sm hover:underline">View All Orders →</Link>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-primary/5 border-b border-slate-800">
                <tr className="text-xs uppercase text-slate-400 font-bold tracking-wider">
                  <th className="px-6 py-4 text-left">Order ID</th>
                  <th className="px-6 py-4 text-left">Customer</th>
                  <th className="px-6 py-4 text-left">Amount</th>
                  <th className="px-6 py-4 text-left">Status</th>
                  <th className="px-6 py-4 text-left">Date</th>
                </tr>
              </thead>
              <tbody>
                {stats?.recentOrders?.map((order) => (
                  <tr key={order._id} className="border-b border-slate-800 hover:bg-primary/5 transition-colors">
                    <td className="px-6 py-4 text-primary font-mono text-sm font-semibold">
                      #{order._id.slice(-8).toUpperCase()}
                    </td>
                    <td className="px-6 py-4">
                      <div>
                        <p className="text-white text-sm font-medium">{order.user?.name}</p>
                        <p className="text-slate-500 text-xs">{order.user?.email}</p>
                      </div>
                    </td>
                    <td className="px-6 py-4 text-white font-semibold text-sm">₹{order.totalAmount?.toLocaleString()}</td>
                    <td className="px-6 py-4">
                      <span className={`badge ${STATUS_COLORS[order.status] || "bg-slate-700 text-slate-300"}`}>
                        {order.status}
                      </span>
                    </td>
                    <td className="px-6 py-4 text-slate-400 text-sm">
                      {new Date(order.createdAt).toLocaleDateString("en-IN")}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </AdminLayout>
  );
}
