import { Link, useNavigate, useLocation } from "react-router-dom";
import { useState } from "react";
import { useAuth } from "../context/AuthContext";
import { useCart } from "../context/CartContext";

export default function Navbar() {
  const { user, isLoggedIn, isAdmin, logout } = useAuth();
  const { cartCount } = useCart();
  const navigate = useNavigate();
  const location = useLocation();
  const [menuOpen, setMenuOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");

  const handleLogout = () => {
    logout();
    navigate("/");
  };

  const handleSearch = (e) => {
    e.preventDefault();
    if (searchQuery.trim()) {
      navigate(`/products?search=${searchQuery.trim()}`);
      setSearchQuery("");
    }
  };

  const navLinks = [
    { label: "Mouse", to: "/products?category=Mouse" },
    { label: "Keyboards", to: "/products?category=Keyboard" },
    { label: "Headsets", to: "/products?category=Headset" },
    { label: "Monitors", to: "/products?category=Monitor" },
    { label: "Deals", to: "/products", highlight: true },
  ];

  return (
    <header className="glass-nav sticky top-0 z-50 border-b border-primary/10 px-6 lg:px-20">
      <div className="max-w-7xl mx-auto flex items-center justify-between py-3 gap-4">

        {/* Logo */}
        <Link to="/" className="flex items-center gap-2 shrink-0">
          <div className="w-8 h-8 bg-primary rounded-lg flex items-center justify-center text-white font-black text-sm neon-glow">
            GG
          </div>
          <span className="text-white text-xl font-bold tracking-tight">
            Game<span className="text-primary">Gear</span>
          </span>
        </Link>

        {/* Nav links — desktop */}
        <nav className="hidden lg:flex items-center gap-6">
          {navLinks.map((link) => (
            <Link
              key={link.label}
              to={link.to}
              className={`text-sm font-medium transition-colors ${
                link.highlight
                  ? "text-primary font-bold"
                  : "text-slate-400 hover:text-white"
              }`}
            >
              {link.label}
            </Link>
          ))}
        </nav>

        {/* Search */}
        <form onSubmit={handleSearch} className="hidden md:flex flex-1 max-w-xs">
          <div className="relative w-full">
            <span className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 text-sm">🔍</span>
            <input
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search gear..."
              className="w-full bg-bg-card2 border border-slate-700 focus:border-primary rounded-lg pl-9 pr-4 py-2 text-sm text-white placeholder-slate-500 outline-none transition-colors"
            />
          </div>
        </form>

        {/* Right side */}
        <div className="flex items-center gap-3">
          {/* Cart */}
          <Link to="/cart" className="relative p-2 text-slate-400 hover:text-primary transition-colors">
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 3h2l.4 2M7 13h10l4-8H5.4M7 13L5.4 5M7 13l-2.293 2.293c-.63.63-.184 1.707.707 1.707H17m0 0a2 2 0 100 4 2 2 0 000-4zm-8 2a2 2 0 11-4 0 2 2 0 014 0z" />
            </svg>
            {cartCount > 0 && (
              <span className="absolute -top-0.5 -right-0.5 w-4 h-4 bg-primary text-white text-[10px] font-bold rounded-full flex items-center justify-center">
                {cartCount > 9 ? "9+" : cartCount}
              </span>
            )}
          </Link>

          {isLoggedIn ? (
            <div className="flex items-center gap-2">
              {isAdmin && (
                <Link to="/admin" className="hidden md:block text-xs bg-primary/20 text-primary border border-primary/30 px-3 py-1.5 rounded-lg font-semibold hover:bg-primary/30 transition-colors">
                  Admin
                </Link>
              )}
              <Link to="/my-orders" className="hidden md:block text-sm text-slate-400 hover:text-white transition-colors font-medium">
                {user?.name?.split(" ")[0]}
              </Link>
              <button onClick={handleLogout} className="text-sm text-slate-400 hover:text-red-400 transition-colors font-medium">
                Logout
              </button>
            </div>
          ) : (
            <div className="flex items-center gap-2">
              <Link to="/login" className="btn-outline text-sm py-2 px-4">Login</Link>
              <Link to="/register" className="btn-primary text-sm py-2 px-4">Sign Up</Link>
            </div>
          )}

          {/* Mobile menu */}
          <button onClick={() => setMenuOpen(!menuOpen)} className="lg:hidden p-2 text-slate-400">
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d={menuOpen ? "M6 18L18 6M6 6l12 12" : "M4 6h16M4 12h16M4 18h16"} />
            </svg>
          </button>
        </div>
      </div>

      {/* Mobile menu dropdown */}
      {menuOpen && (
        <div className="lg:hidden border-t border-slate-800 py-4 space-y-2">
          {navLinks.map((link) => (
            <Link key={link.label} to={link.to} onClick={() => setMenuOpen(false)}
              className="block px-4 py-2 text-slate-400 hover:text-white text-sm font-medium">
              {link.label}
            </Link>
          ))}
          <form onSubmit={handleSearch} className="px-4 pt-2">
            <input value={searchQuery} onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search gear..." className="input-field text-sm" />
          </form>
        </div>
      )}
    </header>
  );
}
