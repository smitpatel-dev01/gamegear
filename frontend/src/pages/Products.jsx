import { useEffect, useState } from "react";
import { useSearchParams } from "react-router-dom";
import api from "../api/api";
import ProductCard from "../components/ProductCard";
import { Spinner } from "../components/ProtectedRoute";

const CATEGORIES = ["Mouse", "Keyboard", "Headset", "Monitor", "Controller"];
const PRICE_RANGES = [
  { label: "Under ₹1,000", min: 0, max: 1000 },
  { label: "₹1,000 – ₹5,000", min: 1000, max: 5000 },
  { label: "₹5,000 – ₹15,000", min: 5000, max: 15000 },
  { label: "Above ₹15,000", min: 15000, max: 999999 },
];

export default function Products() {
  const [searchParams, setSearchParams] = useSearchParams();
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [total, setTotal] = useState(0);
  const [totalPages, setTotalPages] = useState(1);

  const category = searchParams.get("category") || "";
  const search = searchParams.get("search") || "";
  const page = parseInt(searchParams.get("page") || "1");
  const sort = searchParams.get("sort") || "-createdAt";
  const minPrice = searchParams.get("minPrice") || "";
  const maxPrice = searchParams.get("maxPrice") || "";

  useEffect(() => {
    fetchProducts();
  }, [category, search, page, sort, minPrice, maxPrice]);

  const fetchProducts = async () => {
    setLoading(true);
    try {
      const params = new URLSearchParams();
      if (category) params.set("category", category);
      if (search) params.set("search", search);
      if (minPrice) params.set("minPrice", minPrice);
      if (maxPrice) params.set("maxPrice", maxPrice);
      params.set("page", page);
      params.set("limit", 9);
      params.set("sort", sort);

      const res = await api.get(`/products?${params}`);
      setProducts(res.data.products);
      setTotal(res.data.total);
      setTotalPages(res.data.totalPages);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const setParam = (key, value) => {
    const p = new URLSearchParams(searchParams);
    if (value) p.set(key, value); else p.delete(key);
    p.delete("page");
    setSearchParams(p);
  };

  const toggleCategory = (cat) => setParam("category", category === cat ? "" : cat);

  const setPriceRange = (range) => {
    if (minPrice == range.min && maxPrice == range.max) {
      setParam("minPrice", ""); setParam("maxPrice", "");
    } else {
      const p = new URLSearchParams(searchParams);
      p.set("minPrice", range.min); p.set("maxPrice", range.max); p.delete("page");
      setSearchParams(p);
    }
  };

  const setPage = (p) => {
    const params = new URLSearchParams(searchParams);
    params.set("page", p);
    setSearchParams(params);
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  const activePriceRange = PRICE_RANGES.find((r) => r.min == minPrice && r.max == maxPrice);

  return (
    <div className="px-6 lg:px-20 py-10">
      <div className="max-w-7xl mx-auto">

        {/* Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-white">
            {category ? `${category}s` : search ? `Results for "${search}"` : "All Products"}
          </h1>
          <p className="text-slate-400 mt-1">{total} products found</p>
        </div>

        <div className="flex flex-col lg:flex-row gap-8">

          {/* Sidebar Filters */}
          <aside className="w-full lg:w-64 shrink-0">
            <div className="card p-6 sticky top-20 space-y-8">
              <div>
                <h3 className="text-white font-bold text-sm uppercase tracking-wider mb-1">Explorer Filters</h3>
                <div className="h-0.5 w-10 bg-primary rounded mt-1" />
              </div>

              {/* Category */}
              <div>
                <p className="text-primary text-xs font-bold uppercase tracking-wider mb-3">Category</p>
                <div className="space-y-1.5">
                  {CATEGORIES.map((cat) => (
                    <button key={cat} onClick={() => toggleCategory(cat)}
                      className={`flex items-center gap-2 w-full text-left px-3 py-2 rounded-lg text-sm transition-colors ${
                        category === cat ? "bg-primary/20 text-primary border border-primary/30" : "text-slate-400 hover:text-white hover:bg-slate-800"
                      }`}>
                      <span className={`w-4 h-4 rounded border flex items-center justify-center text-xs ${
                        category === cat ? "bg-primary border-primary text-white" : "border-slate-600"
                      }`}>{category === cat && "✓"}</span>
                      {cat}s
                    </button>
                  ))}
                </div>
              </div>

              {/* Price Range */}
              <div>
                <p className="text-primary text-xs font-bold uppercase tracking-wider mb-3">Price Range</p>
                <div className="space-y-1.5">
                  {PRICE_RANGES.map((range) => (
                    <button key={range.label} onClick={() => setPriceRange(range)}
                      className={`flex items-center gap-2 w-full text-left px-3 py-2 rounded-lg text-sm transition-colors ${
                        activePriceRange?.label === range.label ? "bg-primary/20 text-primary border border-primary/30" : "text-slate-400 hover:text-white hover:bg-slate-800"
                      }`}>
                      <span className={`w-4 h-4 rounded border flex items-center justify-center text-xs ${
                        activePriceRange?.label === range.label ? "bg-primary border-primary text-white" : "border-slate-600"
                      }`}>{activePriceRange?.label === range.label && "✓"}</span>
                      {range.label}
                    </button>
                  ))}
                </div>
              </div>

              {/* Clear filters */}
              {(category || minPrice || search) && (
                <button onClick={() => setSearchParams({})}
                  className="w-full text-sm text-red-400 hover:text-red-300 border border-red-400/20 rounded-lg py-2 transition-colors">
                  Clear All Filters
                </button>
              )}
            </div>
          </aside>

          {/* Main content */}
          <div className="flex-1">
            {/* Toolbar */}
            <div className="flex flex-col sm:flex-row justify-between items-center bg-bg-card border border-slate-800 rounded-xl p-4 mb-6 gap-4">
              <span className="text-slate-400 text-sm">
                Showing <span className="text-white font-bold">{products.length}</span> of <span className="text-white font-bold">{total}</span> results
              </span>
              <select value={sort} onChange={(e) => setParam("sort", e.target.value)}
                className="bg-bg-card2 border border-slate-700 rounded-lg px-4 py-2 text-sm text-white outline-none focus:border-primary">
                <option value="-createdAt">Newest Arrivals</option>
                <option value="price">Price: Low to High</option>
                <option value="-price">Price: High to Low</option>
                <option value="-rating">Top Rated</option>
              </select>
            </div>

            {/* Products Grid */}
            {loading ? (
              <div className="flex justify-center py-20"><Spinner size="lg" /></div>
            ) : products.length === 0 ? (
              <div className="text-center py-20 text-slate-400">
                <div className="text-5xl mb-4">🎮</div>
                <p className="text-lg font-semibold text-white">No products found</p>
                <p className="text-sm mt-1">Try adjusting your filters</p>
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
                {products.map((p) => <ProductCard key={p._id} product={p} />)}
              </div>
            )}

            {/* Pagination */}
            {totalPages > 1 && !loading && (
              <div className="flex justify-center items-center gap-2 mt-10">
                <button onClick={() => setPage(page - 1)} disabled={page === 1}
                  className="px-4 py-2 rounded-lg border border-slate-700 text-slate-400 hover:border-primary hover:text-primary disabled:opacity-40 disabled:cursor-not-allowed transition-colors text-sm">
                  ← Prev
                </button>

                {[...Array(totalPages)].map((_, i) => (
                  <button key={i} onClick={() => setPage(i + 1)}
                    className={`w-9 h-9 rounded-lg text-sm font-medium transition-colors ${
                      page === i + 1 ? "bg-primary text-white" : "border border-slate-700 text-slate-400 hover:border-primary hover:text-primary"
                    }`}>
                    {i + 1}
                  </button>
                )).slice(Math.max(0, page - 3), Math.min(totalPages, page + 2))}

                <button onClick={() => setPage(page + 1)} disabled={page === totalPages}
                  className="px-4 py-2 rounded-lg border border-slate-700 text-slate-400 hover:border-primary hover:text-primary disabled:opacity-40 disabled:cursor-not-allowed transition-colors text-sm">
                  Next →
                </button>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
