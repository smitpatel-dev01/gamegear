import { useEffect, useState } from "react";
import { useParams, Link } from "react-router-dom";
import api from "../api/api";
import { useCart } from "../context/CartContext";
import { useAuth } from "../context/AuthContext";
import { Spinner } from "../components/ProtectedRoute";

export default function ProductDetails() {
  const { id } = useParams();
  const { addToCart } = useCart();
  const { isLoggedIn, user } = useAuth();

  const [product, setProduct] = useState(null);
  const [loading, setLoading] = useState(true);
  const [mainImage, setMainImage] = useState("");
  const [qty, setQty] = useState(1);
  const [adding, setAdding] = useState(false);
  const [addMsg, setAddMsg] = useState("");
  const [activeTab, setActiveTab] = useState("specs");

  // Review form
  const [rating, setRating] = useState(5);
  const [comment, setComment] = useState("");
  const [reviewLoading, setReviewLoading] = useState(false);
  const [reviewMsg, setReviewMsg] = useState("");

  useEffect(() => {
    api.get(`/products/${id}`)
      .then((res) => {
        setProduct(res.data);
        setMainImage(res.data.images?.[0]?.url || "");
      })
      .catch(console.error)
      .finally(() => setLoading(false));
  }, [id]);

  const handleAddToCart = async () => {
    setAdding(true);
    const result = await addToCart(product._id, qty);
    setAdding(false);
    if (result?.success !== false) {
      setAddMsg("Added to cart!");
    } else {
      setAddMsg(result.message);
    }
    setTimeout(() => setAddMsg(""), 3000);
  };

  const handleReview = async (e) => {
    e.preventDefault();
    setReviewLoading(true);
    try {
      await api.post(`/products/${id}/reviews`, { rating, comment });
      setReviewMsg("Review added!");
      setComment("");
      // Refresh product
      const res = await api.get(`/products/${id}`);
      setProduct(res.data);
    } catch (err) {
      setReviewMsg(err?.response?.data?.message || "Failed to add review");
    } finally {
      setReviewLoading(false);
      setTimeout(() => setReviewMsg(""), 3000);
    }
  };

  if (loading) return <div className="min-h-screen flex items-center justify-center"><Spinner size="lg" /></div>;
  if (!product) return <div className="min-h-screen flex items-center justify-center text-slate-400">Product not found</div>;

  const price = product.discountPrice || product.price;
  const hasDiscount = product.discountPrice && product.discountPrice < product.price;
  const specs = product.specs ? Object.entries(product.specs) : [];

  return (
    <div className="max-w-7xl mx-auto px-6 lg:px-20 py-10">

      {/* Breadcrumb */}
      <div className="flex items-center gap-2 text-sm text-slate-400 mb-8">
        <Link to="/" className="hover:text-primary">Home</Link>
        <span>›</span>
        <Link to="/products" className="hover:text-primary">Products</Link>
        <span>›</span>
        <Link to={`/products?category=${product.category}`} className="hover:text-primary">{product.category}</Link>
        <span>›</span>
        <span className="text-white">{product.name}</span>
      </div>

      <div className="grid lg:grid-cols-12 gap-12 mb-16">

        {/* Left — Images */}
        <div className="lg:col-span-7 space-y-4">
          <div className="relative rounded-xl overflow-hidden bg-bg-card border border-slate-800 h-[420px]">
            {product.isFeatured && (
              <span className="absolute top-4 left-4 z-10 badge bg-primary text-white">NEW RELEASE</span>
            )}
            <img src={mainImage || "https://placehold.co/600x420/111f28/06a8f9?text=GameGear"}
              alt={product.name}
              className="w-full h-full object-cover hover:scale-105 transition-transform duration-500" />
          </div>

          {product.images?.length > 1 && (
            <div className="grid grid-cols-4 gap-3">
              {product.images.map((img, i) => (
                <button key={i} onClick={() => setMainImage(img.url)}
                  className={`rounded-lg overflow-hidden border-2 transition-colors ${mainImage === img.url ? "border-primary" : "border-slate-800 hover:border-slate-600"}`}>
                  <img src={img.url} alt={`thumb-${i}`} className="w-full h-20 object-cover bg-bg-card" />
                </button>
              ))}
            </div>
          )}
        </div>

        {/* Right — Details */}
        <div className="lg:col-span-5 flex flex-col">
          <span className="text-primary text-sm font-bold uppercase tracking-widest mb-2">{product.brand}</span>

          <h1 className="text-4xl font-bold text-white mb-4">{product.name}</h1>

          {/* Rating */}
          {product.numReviews > 0 && (
            <div className="flex items-center gap-2 mb-4">
              <div className="flex text-yellow-400">
                {"★".repeat(Math.round(product.rating))}{"☆".repeat(5 - Math.round(product.rating))}
              </div>
              <span className="text-slate-400 text-sm">{product.rating} ({product.numReviews} reviews)</span>
            </div>
          )}

          {/* Price */}
          <div className="flex items-baseline gap-3 mb-6">
            <span className="text-4xl font-bold text-primary">₹{price.toLocaleString()}</span>
            {hasDiscount && (
              <>
                <span className="text-slate-500 text-xl line-through">₹{product.price.toLocaleString()}</span>
                <span className="badge bg-red-500/20 text-red-400 border border-red-500/20">
                  {Math.round((1 - product.discountPrice / product.price) * 100)}% OFF
                </span>
              </>
            )}
          </div>

          {/* Description */}
          {product.description && (
            <p className="text-slate-400 leading-relaxed mb-6">{product.description}</p>
          )}

          {/* Spec highlights */}
          {specs.length > 0 && (
            <div className="grid grid-cols-2 gap-3 mb-6">
              {specs.slice(0, 4).map(([key, val]) => (
                <div key={key} className="glass-card rounded-xl p-3">
                  <p className="text-slate-500 text-xs mb-1">{key}</p>
                  <p className="text-white font-semibold text-sm">{val}</p>
                </div>
              ))}
            </div>
          )}

          {/* Stock */}
          <div className="flex items-center gap-2 mb-6">
            {product.stock > 0 ? (
              <span className="text-green-400 text-sm font-semibold">● In Stock ({product.stock} available)</span>
            ) : (
              <span className="text-red-400 text-sm font-semibold">● Out of Stock</span>
            )}
          </div>

          {/* Qty + Add to Cart */}
          {product.stock > 0 && (
            <div className="flex items-center gap-3 mb-4">
              <div className="flex items-center bg-bg-card2 border border-slate-700 rounded-lg">
                <button onClick={() => setQty(Math.max(1, qty - 1))} className="px-4 py-3 text-slate-400 hover:text-primary font-bold">−</button>
                <span className="px-5 font-bold text-white">{qty}</span>
                <button onClick={() => setQty(Math.min(product.stock, qty + 1))} className="px-4 py-3 text-slate-400 hover:text-primary font-bold">+</button>
              </div>
              <button onClick={handleAddToCart} disabled={adding}
                className="flex-1 btn-primary h-12 text-base disabled:opacity-60">
                {adding ? "Adding..." : "🛒 Add to Cart"}
              </button>
            </div>
          )}

          {addMsg && (
            <div className={`text-sm px-4 py-2 rounded-lg mb-4 ${addMsg.includes("Added") ? "bg-green-500/10 text-green-400 border border-green-500/20" : "bg-red-500/10 text-red-400 border border-red-500/20"}`}>
              {addMsg}
            </div>
          )}

          {/* Trust badges */}
          <div className="flex gap-4 text-xs text-slate-400 flex-wrap">
            <span className="flex items-center gap-1">✅ In Stock</span>
            <span className="flex items-center gap-1">🚚 Free delivery above ₹999</span>
            <span className="flex items-center gap-1">🔒 2 Year Warranty</span>
          </div>
        </div>
      </div>

      {/* Tabs */}
      <div className="border-b border-slate-800 mb-8">
        <div className="flex gap-8">
          {["specs", "reviews"].map((tab) => (
            <button key={tab} onClick={() => setActiveTab(tab)}
              className={`pb-4 text-sm font-semibold capitalize transition-colors border-b-2 -mb-px ${
                activeTab === tab ? "border-primary text-primary" : "border-transparent text-slate-400 hover:text-white"
              }`}>
              {tab === "specs" ? "Technical Specs" : `Customer Reviews (${product.numReviews})`}
            </button>
          ))}
        </div>
      </div>

      {activeTab === "specs" && (
        <div className="grid md:grid-cols-2 gap-6">
          <div className="card p-6">
            <h3 className="text-white font-bold mb-4 flex items-center gap-2">⚙️ Specifications</h3>
            {specs.length > 0 ? (
              <ul className="space-y-3">
                {specs.map(([key, val]) => (
                  <li key={key} className="flex justify-between text-sm border-b border-slate-800 pb-2">
                    <span className="text-slate-400">{key}</span>
                    <span className="text-white font-medium">{val}</span>
                  </li>
                ))}
              </ul>
            ) : (
              <p className="text-slate-500 text-sm">No specifications available.</p>
            )}
          </div>
          <div className="card p-6">
            <h3 className="text-white font-bold mb-4 flex items-center gap-2">📦 Product Info</h3>
            <ul className="space-y-3 text-sm">
              {[["Category", product.category], ["Brand", product.brand], ["Stock", product.stock], ["SKU", product._id.slice(-8).toUpperCase()]].map(([k, v]) => (
                <li key={k} className="flex justify-between border-b border-slate-800 pb-2">
                  <span className="text-slate-400">{k}</span>
                  <span className="text-white font-medium">{v}</span>
                </li>
              ))}
            </ul>
          </div>
        </div>
      )}

      {activeTab === "reviews" && (
        <div className="space-y-6">
          {/* Add review */}
          {isLoggedIn && (
            <div className="card p-6">
              <h3 className="text-white font-bold mb-4">Write a Review</h3>
              <form onSubmit={handleReview} className="space-y-4">
                <div>
                  <label className="text-slate-400 text-sm mb-2 block">Rating</label>
                  <div className="flex gap-2">
                    {[1,2,3,4,5].map((r) => (
                      <button key={r} type="button" onClick={() => setRating(r)}
                        className={`text-2xl transition-colors ${r <= rating ? "text-yellow-400" : "text-slate-600"}`}>★</button>
                    ))}
                  </div>
                </div>
                <textarea value={comment} onChange={(e) => setComment(e.target.value)}
                  placeholder="Share your experience..." required
                  className="input-field h-24 resize-none" />
                <button type="submit" disabled={reviewLoading} className="btn-primary">
                  {reviewLoading ? "Submitting..." : "Submit Review"}
                </button>
                {reviewMsg && <p className="text-sm text-primary">{reviewMsg}</p>}
              </form>
            </div>
          )}

          {/* Reviews list */}
          {product.reviews?.length > 0 ? (
            <div className="space-y-4">
              {product.reviews.map((review) => (
                <div key={review._id} className="card p-5">
                  <div className="flex justify-between items-start mb-2">
                    <div>
                      <span className="text-white font-semibold">{review.name}</span>
                      <div className="text-yellow-400 text-sm mt-0.5">{"★".repeat(review.rating)}{"☆".repeat(5-review.rating)}</div>
                    </div>
                    <span className="text-slate-500 text-xs">{new Date(review.createdAt).toLocaleDateString()}</span>
                  </div>
                  <p className="text-slate-400 text-sm">{review.comment}</p>
                </div>
              ))}
            </div>
          ) : (
            <div className="text-center py-12 text-slate-400">
              <p>No reviews yet. Be the first to review!</p>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
