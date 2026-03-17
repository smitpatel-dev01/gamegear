import { useEffect, useState } from "react";
import api from "../api/api";
import AdminLayout from "./AdminLayout";
import { Spinner } from "../components/ProtectedRoute";

export default function AdminUsers() {
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [page, setPage] = useState(1);
  const [total, setTotal] = useState(0);
  const [totalPages, setTotalPages] = useState(1);
  const [togglingId, setTogglingId] = useState(null);

  useEffect(() => { fetchUsers(); }, [page, search]);

  const fetchUsers = async () => {
    setLoading(true);
    try {
      const params = new URLSearchParams({ page, limit: 15 });
      if (search) params.set("search", search);
      const res = await api.get(`/users?${params}`);
      setUsers(res.data.users);
      setTotal(res.data.total);
      setTotalPages(res.data.totalPages);
    } catch (err) { console.error(err); }
    finally { setLoading(false); }
  };

  const toggleStatus = async (id) => {
    setTogglingId(id);
    try {
      const res = await api.patch(`/users/${id}/toggle-status`);
      setUsers((prev) => prev.map((u) => u._id === id ? { ...u, isActive: res.data.isActive } : u));
    } catch (err) { alert(err?.response?.data?.message || "Failed"); }
    finally { setTogglingId(null); }
  };

  return (
    <AdminLayout>
      <div className="p-8">
        <div className="flex items-center justify-between mb-8">
          <div>
            <h1 className="text-3xl font-bold text-white">Customers</h1>
            <p className="text-slate-400 mt-1">{total} registered users</p>
          </div>
        </div>

        {/* Search */}
        <div className="card p-4 mb-6">
          <input value={search} onChange={(e) => { setSearch(e.target.value); setPage(1); }}
            placeholder="Search by name or email..."
            className="input-field max-w-sm" />
        </div>

        <div className="card overflow-hidden">
          {loading ? (
            <div className="flex justify-center py-16"><Spinner size="lg" /></div>
          ) : (
            <>
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead className="bg-primary/5 border-b border-slate-800">
                    <tr className="text-xs uppercase text-slate-400 font-bold tracking-wider">
                      <th className="px-6 py-4 text-left">User</th>
                      <th className="px-6 py-4 text-left">Role</th>
                      <th className="px-6 py-4 text-left">Joined</th>
                      <th className="px-6 py-4 text-left">Status</th>
                      <th className="px-6 py-4 text-right">Actions</th>
                    </tr>
                  </thead>
                  <tbody>
                    {users.map((user) => (
                      <tr key={user._id} className="border-b border-slate-800 hover:bg-primary/5 transition-colors">
                        <td className="px-6 py-4">
                          <div className="flex items-center gap-3">
                            <div className="w-9 h-9 rounded-full bg-primary/20 border border-primary/20 flex items-center justify-center text-primary font-bold text-sm shrink-0">
                              {user.name?.[0]?.toUpperCase()}
                            </div>
                            <div>
                              <p className="text-white font-semibold text-sm">{user.name}</p>
                              <p className="text-slate-400 text-xs">{user.email}</p>
                            </div>
                          </div>
                        </td>
                        <td className="px-6 py-4">
                          <span className={`badge ${user.role === "admin" ? "bg-primary/20 text-primary border border-primary/20" : "bg-slate-700/50 text-slate-300"}`}>
                            {user.role}
                          </span>
                        </td>
                        <td className="px-6 py-4 text-slate-400 text-sm">
                          {new Date(user.createdAt).toLocaleDateString("en-IN")}
                        </td>
                        <td className="px-6 py-4">
                          <span className={`badge ${user.isActive ? "bg-green-500/10 text-green-400" : "bg-red-500/10 text-red-400"}`}>
                            {user.isActive ? "Active" : "Banned"}
                          </span>
                        </td>
                        <td className="px-6 py-4 text-right">
                          {user.role !== "admin" && (
                            <button onClick={() => toggleStatus(user._id)} disabled={togglingId === user._id}
                              className={`text-xs px-3 py-1.5 rounded-lg transition-colors disabled:opacity-50 ${
                                user.isActive
                                  ? "text-red-400 bg-red-500/10 hover:bg-red-500/20"
                                  : "text-green-400 bg-green-500/10 hover:bg-green-500/20"
                              }`}>
                              {togglingId === user._id ? "..." : user.isActive ? "Ban User" : "Unban User"}
                            </button>
                          )}
                        </td>
                      </tr>
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
