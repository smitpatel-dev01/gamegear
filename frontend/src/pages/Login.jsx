import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import api from "../api/api";
import { useAuth } from "../context/AuthContext";

export default function Login() {
  const navigate = useNavigate();
  const { login } = useAuth();
  const [form, setForm] = useState({ email: "", password: "" });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [showPass, setShowPass] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true); setError("");
    try {
      const res = await api.post("/auth/login", form);
      login(res.data.user, res.data.token);
      navigate(res.data.user.role === "admin" ? "/admin" : "/");
    } catch (err) {
      setError(err?.response?.data?.message || "Login failed");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-[calc(100vh-80px)] flex items-center justify-center px-4 py-16">
      <div className="w-full max-w-5xl grid lg:grid-cols-2 gap-0 rounded-2xl overflow-hidden border border-slate-800">

        {/* Left — Visual */}
        <div className="hidden lg:flex relative bg-gradient-to-br from-bg-dark to-bg-card flex-col justify-end p-10 overflow-hidden">
          <div className="absolute inset-0 circuit-bg opacity-50" />
          <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-64 h-64 bg-primary/20 blur-[100px] rounded-full" />
          <div className="relative z-10">
            <span className="badge bg-primary/20 text-primary border border-primary/30 mb-4 inline-block">PRO TIER ACCESS</span>
            <h2 className="text-4xl font-bold text-white leading-tight mb-3">
              Join the <span className="text-primary">Elite</span>
            </h2>
            <p className="text-slate-400 text-sm leading-relaxed">
              Unlock exclusive gaming deals, track your orders, and connect with the global elite community.
            </p>
          </div>
        </div>

        {/* Right — Form */}
        <div className="bg-bg-card p-10">
          <div className="mb-8">
            <h1 className="text-2xl font-bold text-white mb-1">Welcome Back</h1>
            <p className="text-slate-400 text-sm">Enter your credentials to access your gear</p>
          </div>

          {error && (
            <div className="bg-red-500/10 border border-red-500/20 text-red-400 text-sm px-4 py-3 rounded-lg mb-6">
              {error}
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-5">
            <div>
              <label className="text-slate-400 text-sm mb-2 block">Email Address</label>
              <div className="relative">
                <span className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-500 text-sm">✉️</span>
                <input type="email" placeholder="name@example.com" required
                  value={form.email} onChange={(e) => setForm({ ...form, email: e.target.value })}
                  className="input-field pl-9" />
              </div>
            </div>

            <div>
              <div className="flex justify-between mb-2">
                <label className="text-slate-400 text-sm">Password</label>
                <Link to="/forgot-password" className="text-primary text-xs hover:underline">Forgot password?</Link>
              </div>
              <div className="relative">
                <span className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-500 text-sm">🔒</span>
                <input type={showPass ? "text" : "password"} placeholder="••••••••" required
                  value={form.password} onChange={(e) => setForm({ ...form, password: e.target.value })}
                  className="input-field pl-9 pr-10" />
                <button type="button" onClick={() => setShowPass(!showPass)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-500 hover:text-slate-300 text-sm">
                  {showPass ? "🙈" : "👁️"}
                </button>
              </div>
            </div>

            <button type="submit" disabled={loading} className="btn-primary w-full py-3 text-base disabled:opacity-60">
              {loading ? "Signing In..." : "Sign In"}
            </button>
          </form>

          <p className="text-center text-slate-400 text-sm mt-6">
            Don't have an account?{" "}
            <Link to="/register" className="text-primary font-semibold hover:underline">Join the Elite for free</Link>
          </p>
        </div>
      </div>
    </div>
  );
}
