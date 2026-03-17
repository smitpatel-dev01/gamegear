import { useEffect, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import api from "../api/api";
import ProductCard from "../components/ProductCard";

const HERO_SLIDES = [
  { image: "https://pngimg.com/uploads/keyboard/keyboard_PNG101845.png", label: "Mechanical Keyboards", tag: "NEW ARRIVAL: V3 PRO SERIES" },
  { image: "https://pngimg.com/uploads/computer_mouse/computer_mouse_PNG7672.png", label: "Precision Mice", tag: "ZERO-LATENCY WIRELESS" },
  { image: "https://pngimg.com/uploads/headphones/headphones_PNG101982.png", label: "7.1 Surround Headsets", tag: "IMMERSIVE AUDIO" },
];

const CATEGORIES = [
  { name: "Mouse", icon: "🖱️", label: "Mouse" },
  { name: "Keyboard", icon: "⌨️", label: "Keyboards" },
  { name: "Headset", icon: "🎧", label: "Headsets" },
  { name: "Monitor", icon: "🖥️", label: "Monitors" },
  { name: "Controller", icon: "🎮", label: "Controllers" },
];

function HeroSection() {
  const [index, setIndex] = useState(0);
  const navigate = useNavigate();

  useEffect(() => {
    const t = setInterval(() => setIndex((p) => (p + 1) % HERO_SLIDES.length), 4000);
    return () => clearInterval(t);
  }, []);

  const slide = HERO_SLIDES[index];

  return (
    <section className="relative overflow-hidden circuit-bg pt-16 pb-24 px-6 lg:px-20">
      <div className="absolute top-0 right-0 w-[600px] h-[600px] bg-primary/10 blur-[180px] rounded-full pointer-events-none" />

      <div className="max-w-7xl mx-auto flex flex-col lg:flex-row items-center gap-12">
        {/* Left */}
        <div className="flex-1 space-y-7 text-center lg:text-left fade-in">
          <span className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-primary/10 border border-primary/20 text-primary text-xs font-bold uppercase tracking-widest">
            {slide.tag}
          </span>

          <h1 className="text-5xl md:text-6xl font-bold leading-[1.1] tracking-tight text-white">
            Elite Gaming{" "}
            <span className="text-primary">{slide.label}</span>
          </h1>

          <p className="text-slate-400 text-lg max-w-xl mx-auto lg:mx-0">
            Level up your performance with professional-grade gaming peripherals engineered for speed, precision and dominance.
          </p>

          <div className="flex flex-col sm:flex-row gap-4 justify-center lg:justify-start">
            <button onClick={() => navigate("/products")} className="btn-primary h-13 px-10 text-base">
              Shop Now →
            </button>
            <button onClick={() => navigate("/products?featured=true")} className="btn-outline h-13 px-10 text-base">
              View Deals
            </button>
          </div>

          <div className="flex items-center gap-3 justify-center lg:justify-start">
            <div className="flex -space-x-2">
              {["🎮","👾","🕹️"].map((e, i) => (
                <div key={i} className="w-8 h-8 rounded-full bg-bg-card2 border-2 border-bg-dark flex items-center justify-center text-sm">{e}</div>
              ))}
            </div>
            <span className="text-slate-400 text-sm"><span className="text-white font-bold">12k+</span> Gamers leveled up this month</span>
          </div>
        </div>

        {/* Right */}
        <div className="flex-1 relative flex items-center justify-center">
          <div className="absolute w-[420px] h-[420px] bg-primary/20 blur-[140px] rounded-full" />
          <div className="relative z-10 w-[460px] h-[400px] glass-card rounded-2xl flex items-center justify-center shadow-2xl">
            <img key={index} src={slide.image} alt={slide.label}
              className="w-[320px] h-[320px] object-contain fade-in" />
          </div>
          <div className="absolute bottom-[-30px] flex gap-2">
            {HERO_SLIDES.map((_, i) => (
              <button key={i} onClick={() => setIndex(i)}
                className={`rounded-full transition-all ${i === index ? "w-6 h-2.5 bg-primary" : "w-2.5 h-2.5 bg-slate-600 hover:bg-slate-400"}`} />
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}

function CategorySection() {
  return (
    <section className="px-6 lg:px-20 py-16">
      <div className="max-w-7xl mx-auto">
        <div className="flex items-end justify-between mb-10">
          <div>
            <h2 className="text-3xl font-bold text-white">Browse Categories</h2>
            <p className="text-slate-400 text-sm mt-1">Find the perfect tool for your playstyle</p>
          </div>
          <Link to="/products" className="text-primary text-sm font-semibold hover:underline hidden md:block">
            View all →
          </Link>
        </div>

        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-4">
          {CATEGORIES.map((cat) => (
            <Link key={cat.name} to={`/products?category=${cat.name}`}
              className="group aspect-square rounded-2xl bg-bg-card border border-slate-800 hover:border-primary/40 flex flex-col items-center justify-center gap-3 transition-all hover:shadow-lg hover:shadow-primary/10">
              <span className="text-4xl">{cat.icon}</span>
              <span className="text-sm font-semibold text-slate-300 group-hover:text-primary transition-colors">{cat.label}</span>
            </Link>
          ))}
        </div>
      </div>
    </section>
  );
}

function FeaturedProducts() {
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    api.get("/products?featured=true&limit=4")
      .then((res) => setProducts(res.data.products))
      .catch(console.error)
      .finally(() => setLoading(false));
  }, []);

  return (
    <section className="px-6 lg:px-20 py-16 bg-bg-card/30">
      <div className="max-w-7xl mx-auto">
        <div className="flex items-end justify-between mb-10">
          <div>
            <h2 className="text-3xl font-bold text-white">Featured Products</h2>
            <p className="text-slate-400 mt-1">The most wanted gear by professionals</p>
          </div>
          <Link to="/products" className="text-primary text-sm font-semibold hover:underline hidden md:block">
            View all collection →
          </Link>
        </div>

        {loading ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
            {[...Array(4)].map((_, i) => (
              <div key={i} className="h-72 bg-bg-card rounded-xl animate-pulse" />
            ))}
          </div>
        ) : products.length > 0 ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
            {products.map((p) => <ProductCard key={p._id} product={p} />)}
          </div>
        ) : (
          <div className="text-center py-16 text-slate-400">No featured products yet.</div>
        )}
      </div>
    </section>
  );
}

function WhyUs() {
  const perks = [
    { icon: "🚚", title: "Free Shipping", desc: "On orders above ₹999" },
    { icon: "🔒", title: "2 Year Warranty", desc: "On all products" },
    { icon: "↩️", title: "Easy Returns", desc: "30-day hassle-free returns" },
    { icon: "🎧", title: "24/7 Support", desc: "Always here to help" },
  ];

  return (
    <section className="px-6 lg:px-20 py-16">
      <div className="max-w-7xl mx-auto grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
        {perks.map((p) => (
          <div key={p.title} className="card p-6 text-center">
            <div className="text-3xl mb-3">{p.icon}</div>
            <h3 className="text-white font-bold mb-1">{p.title}</h3>
            <p className="text-slate-400 text-sm">{p.desc}</p>
          </div>
        ))}
      </div>
    </section>
  );
}

export default function Home() {
  return (
    <div>
      <HeroSection />
      <CategorySection />
      <FeaturedProducts />
      <WhyUs />
    </div>
  );
}
