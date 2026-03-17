import { Link } from "react-router-dom";
import { useState } from "react";
import { useCart } from "../context/CartContext";

export default function ProductCard({ product }) {
  const { addToCart } = useCart();
  const [adding, setAdding] = useState(false);
  const [added, setAdded] = useState(false);

  const imageUrl = product.images?.[0]?.url || "https://placehold.co/400x300/111f28/06a8f9?text=No+Image";
  const price = product.discountPrice || product.price;
  const hasDiscount = product.discountPrice && product.discountPrice < product.price;

  const handleAddToCart = async (e) => {
    e.preventDefault();
    setAdding(true);
    const result = await addToCart(product._id, 1);
    setAdding(false);
    if (result?.success !== false) {
      setAdded(true);
      setTimeout(() => setAdded(false), 2000);
    }
  };

  return (
    <div className="group relative flex flex-col bg-bg-card border border-slate-800 hover:border-primary/40 rounded-xl overflow-hidden transition-all duration-300 hover:shadow-lg hover:shadow-primary/10">

      {/* Badges */}
      <div className="absolute top-3 left-3 z-10 flex gap-2">
        {product.isFeatured && (
          <span className="badge bg-primary text-white">HOT</span>
        )}
        {hasDiscount && (
          <span className="badge bg-red-500 text-white">
            -{Math.round((1 - product.discountPrice / product.price) * 100)}%
          </span>
        )}
        {product.stock === 0 && (
          <span className="badge bg-slate-700 text-slate-300">Out of Stock</span>
        )}
      </div>

      {/* Image */}
      <Link to={`/products/${product._id}`}>
        <div className="relative h-52 bg-bg-card2 overflow-hidden">
          <img
            src={imageUrl}
            alt={product.name}
            className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105"
          />
        </div>
      </Link>

      {/* Content */}
      <div className="flex flex-col flex-1 p-4">
        <span className="text-primary text-xs font-semibold uppercase tracking-wider mb-1">
          {product.brand}
        </span>

        <Link to={`/products/${product._id}`}>
          <h3 className="text-white font-bold text-base mb-1 hover:text-primary transition-colors line-clamp-2">
            {product.name}
          </h3>
        </Link>

        {/* Rating */}
        {product.numReviews > 0 && (
          <div className="flex items-center gap-1 mb-3">
            <div className="flex text-yellow-400 text-xs">
              {"★".repeat(Math.round(product.rating))}{"☆".repeat(5 - Math.round(product.rating))}
            </div>
            <span className="text-slate-500 text-xs">({product.numReviews})</span>
          </div>
        )}

        <div className="mt-auto flex items-center justify-between pt-3 border-t border-slate-800">
          <div>
            <span className="text-white font-bold text-lg">₹{price.toLocaleString()}</span>
            {hasDiscount && (
              <span className="text-slate-500 text-sm line-through ml-2">₹{product.price.toLocaleString()}</span>
            )}
          </div>

          <button
            onClick={handleAddToCart}
            disabled={adding || product.stock === 0}
            className={`w-9 h-9 rounded-lg flex items-center justify-center transition-all font-bold text-sm ${
              added
                ? "bg-green-500 text-white"
                : product.stock === 0
                ? "bg-slate-700 text-slate-500 cursor-not-allowed"
                : "bg-primary/20 hover:bg-primary text-primary hover:text-white border border-primary/30"
            }`}
          >
            {adding ? "..." : added ? "✓" : "+"}
          </button>
        </div>
      </div>
    </div>
  );
}
