import { Link, useLocation, useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";

const NAV = [
  { label: "Dashboard", icon: "📊", to: "/admin" },
  { label: "Products", icon: "📦", to: "/admin/products" },
  { label: "Orders", icon: "🛒", to: "/admin/orders" },
  { label: "Customers", icon: "👥", to: "/admin/users" },
];

export default function AdminLayout({ children }) {
  const { pathname } = useLocation();
  const { user, logout } = useAuth();
  const navigate = useNavigate();

  const handleLogout = () => { logout(); navigate("/"); };

  return (
    <div className="flex min-h-screen">
      {/* Sidebar */}
      <aside className="w-64 bg-bg-card border-r border-slate-800 flex flex-col fixed h-full z-30">
        <div className="p-6 flex items-center gap-3 border-b border-slate-800">
          <div className="w-10 h-10 rounded-xl bg-primary flex items-center justify-center text-white font-black neon-glow">GG</div>
          <div>
            <p className="text-white font-bold text-sm">GameGear</p>
            <p className="text-slate-500 text-xs">Admin Panel</p>
          </div>
        </div>

        <nav className="flex-1 p-4 space-y-1">
          {NAV.map((item) => (
            <Link key={item.to} to={item.to}
              className={`flex items-center gap-3 px-4 py-2.5 rounded-lg text-sm font-medium transition-colors ${
                pathname === item.to
                  ? "bg-primary/20 text-primary border border-primary/20"
                  : "text-slate-400 hover:text-white hover:bg-slate-800"
              }`}>
              <span>{item.icon}</span>
              {item.label}
            </Link>
          ))}

          <div className="pt-4 border-t border-slate-800 mt-4">
            <p className="text-xs text-slate-600 uppercase font-bold px-4 mb-2">Management</p>
            <Link to="/" className="flex items-center gap-3 px-4 py-2.5 rounded-lg text-sm text-slate-400 hover:text-white hover:bg-slate-800">
              <span>🌐</span> View Store
            </Link>
          </div>
        </nav>

        <div className="p-4 border-t border-slate-800">
          <div className="flex items-center gap-3 px-2 py-2">
            <div className="w-8 h-8 rounded-full bg-primary/20 border border-primary/30 flex items-center justify-center text-primary font-bold text-sm">
              {user?.name?.[0]?.toUpperCase()}
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-white text-xs font-semibold truncate">{user?.name}</p>
              <p className="text-slate-500 text-xs">Super Admin</p>
            </div>
            <button onClick={handleLogout} className="text-slate-500 hover:text-red-400 text-xs transition-colors" title="Logout">
              ⎋
            </button>
          </div>
        </div>
      </aside>

      {/* Main */}
      <main className="flex-1 ml-64 bg-bg-dark min-h-screen">
        {children}
      </main>
    </div>
  );
}
