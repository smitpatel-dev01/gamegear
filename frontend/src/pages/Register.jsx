import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import api from "../api/api";
import { useAuth } from "../context/AuthContext";

export default function Register() {
  const navigate = useNavigate();
  const { login } = useAuth();
  const [form, setForm] = useState({ name: "", email: "", password: "", confirm: "" });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [showPass, setShowPass] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (form.password !== form.confirm) return setError("Passwords do not match");
    setLoading(true); setError("");
    try {
      const res = await api.post("/auth/register", {
        name: form.name, email: form.email, password: form.password,
      });
      login(res.data.user, res.data.token);
      navigate("/");
    } catch (err) {
      setError(err?.response?.data?.message || "Registration failed");
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
            <div className="grid grid-cols-2 gap-3 mb-8">
              {["🖱️ Precision Mice", "⌨️ Mechanical Keyboards", "🎧 7.1 Headsets", "🖥️ 4K Monitors"].map((item) => (
                <div key={item} className="glass-card rounded-xl p-3 text-sm text-slate-300 font-medium">{item}</div>
              ))}
            </div>
            <h2 className="text-4xl font-bold text-white leading-tight mb-3">
              Level Up Your <span className="text-primary">Setup</span>
            </h2>
            <p className="text-slate-400 text-sm">Join 12,000+ gamers who trust GameGear for elite peripherals.</p>
          </div>
        </div>

        {/* Right — Form */}
        <div className="bg-bg-card p-10">
          <div className="mb-8">
            <h1 className="text-2xl font-bold text-white mb-1">Create Account</h1>
            <p className="text-slate-400 text-sm">Join the elite gaming community</p>
          </div>

          {error && (
            <div className="bg-red-500/10 border border-red-500/20 text-red-400 text-sm px-4 py-3 rounded-lg mb-6">
              {error}
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="text-slate-400 text-sm mb-2 block">Full Name</label>
              <input type="text" placeholder="John Doe" required
                value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })}
                className="input-field" />
            </div>
            <div>
              <label className="text-slate-400 text-sm mb-2 block">Email Address</label>
              <input type="email" placeholder="name@example.com" required
                value={form.email} onChange={(e) => setForm({ ...form, email: e.target.value })}
                className="input-field" />
            </div>
            <div>
              <label className="text-slate-400 text-sm mb-2 block">Password</label>
              <div className="relative">
                <input type={showPass ? "text" : "password"} placeholder="Min. 6 characters" required minLength={6}
                  value={form.password} onChange={(e) => setForm({ ...form, password: e.target.value })}
                  className="input-field pr-10" />
                <button type="button" onClick={() => setShowPass(!showPass)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-500 hover:text-slate-300 text-sm">
                  {showPass ? "🙈" : "👁️"}
                </button>
              </div>
            </div>
            <div>
              <label className="text-slate-400 text-sm mb-2 block">Confirm Password</label>
              <input type="password" placeholder="Re-enter password" required
                value={form.confirm} onChange={(e) => setForm({ ...form, confirm: e.target.value })}
                className="input-field" />
            </div>

            <button type="submit" disabled={loading} className="btn-primary w-full py-3 text-base disabled:opacity-60 mt-2">
              {loading ? "Creating Account..." : "Create Account →"}
            </button>
          </form>

          <p className="text-center text-slate-400 text-sm mt-6">
            Already have an account?{" "}
            <Link to="/login" className="text-primary font-semibold hover:underline">Sign In</Link>
          </p>
        </div>
      </div>
    </div>
  );
}
