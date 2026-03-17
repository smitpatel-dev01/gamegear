import { Link, useNavigate } from "react-router-dom";
import { useCart } from "../context/CartContext";
import { useAuth } from "../context/AuthContext";

export default function Cart() {
  const { cart, cartTotal, updateQuantity, removeFromCart, clearCart, cartLoading } = useCart();
  const { isLoggedIn } = useAuth();
  const navigate = useNavigate();

  const shipping = cartTotal >= 999 ? 0 : 99;
  const grandTotal = cartTotal + shipping;

  if (!isLoggedIn) {
    return (
      <div className="min-h-[60vh] flex flex-col items-center justify-center gap-4 text-center px-4">
        <div className="text-6xl">🛒</div>
        <h2 className="text-2xl font-bold text-white">Please login to view your cart</h2>
        <Link to="/login" className="btn-primary">Login Now</Link>
      </div>
    );
  }

  if (cart.length === 0) {
    return (
      <div className="min-h-[60vh] flex flex-col items-center justify-center gap-4 text-center px-4">
        <div className="text-6xl">🛒</div>
        <h2 className="text-2xl font-bold text-white">Your Armory is Empty</h2>
        <p className="text-slate-400">Add some legendary gear to get started</p>
        <Link to="/products" className="btn-primary">Browse Products</Link>
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto px-6 lg:px-20 py-10">
      {/* Header */}
      <div className="mb-8">
        <h1 className="text-4xl font-black text-white tracking-tight">YOUR ARMORY</h1>
        <p className="text-slate-400 mt-1">{cart.length} legendary item{cart.length !== 1 && "s"} ready for deployment</p>
      </div>

      <div className="flex flex-col lg:flex-row gap-8">

        {/* Cart Table */}
        <div className="flex-1">
          <div className="card overflow-hidden">
            {/* Header row */}
            <div className="grid grid-cols-12 gap-4 px-6 py-4 bg-primary/5 border-b border-slate-800 text-xs uppercase text-slate-400 font-bold tracking-wider">
              <div className="col-span-6">Product</div>
              <div className="col-span-2 text-center">Qty</div>
              <div className="col-span-2 text-center">Price</div>
              <div className="col-span-2 text-right">Total</div>
            </div>

            {cart.map((item) => {
              const price = item.product?.discountPrice || item.product?.price || 0;
              const itemTotal = price * item.quantity;
              const imageUrl = item.product?.images?.[0]?.url || "https://placehold.co/80x80/111f28/06a8f9?text=GG";

              return (
                <div key={item.product?._id} className="grid grid-cols-12 gap-4 px-6 py-5 border-b border-slate-800 items-center">
                  {/* Product */}
                  <div className="col-span-6 flex items-center gap-4">
                    <img src={imageUrl} alt={item.product?.name}
                      className="w-16 h-16 object-cover rounded-lg bg-bg-card2 border border-slate-800 shrink-0" />
                    <div>
                      <Link to={`/products/${item.product?._id}`}
                        className="text-white font-semibold hover:text-primary transition-colors line-clamp-2 text-sm">
                        {item.product?.name}
                      </Link>
                      <p className="text-primary text-xs mt-0.5">{item.product?.brand}</p>
                    </div>
                  </div>

                  {/* Quantity */}
                  <div className="col-span-2 flex items-center justify-center">
                    <div className="flex items-center bg-bg-card2 border border-slate-700 rounded-lg">
                      <button onClick={() => item.quantity > 1 ? updateQuantity(item.product._id, item.quantity - 1) : removeFromCart(item.product._id)}
                        className="px-2.5 py-1.5 text-slate-400 hover:text-primary font-bold text-sm">−</button>
                      <span className="px-3 text-white font-bold text-sm">{item.quantity}</span>
                      <button onClick={() => updateQuantity(item.product._id, item.quantity + 1)}
                        className="px-2.5 py-1.5 text-slate-400 hover:text-primary font-bold text-sm">+</button>
                    </div>
                  </div>

                  {/* Price */}
                  <div className="col-span-2 text-center text-slate-300 text-sm">₹{price.toLocaleString()}</div>

                  {/* Total + Remove */}
                  <div className="col-span-2 flex flex-col items-end gap-1">
                    <span className="text-primary font-bold text-sm">₹{itemTotal.toLocaleString()}</span>
                    <button onClick={() => removeFromCart(item.product._id)}
                      className="text-red-400 hover:text-red-300 text-xs transition-colors">Remove</button>
                  </div>
                </div>
              );
            })}

            {/* Footer */}
            <div className="px-6 py-4 flex justify-between items-center">
              <Link to="/products" className="text-sm text-slate-400 hover:text-primary flex items-center gap-1 transition-colors">
                ← Continue Shopping
              </Link>
              <button onClick={clearCart} className="text-sm text-red-400 hover:text-red-300 transition-colors">
                Clear Cart
              </button>
            </div>
          </div>
        </div>

        {/* Order Summary */}
        <aside className="w-full lg:w-80 shrink-0">
          <div className="card p-6 sticky top-20">
            <h3 className="text-xl font-bold text-white mb-6 flex items-center gap-2">🧾 Order Summary</h3>

            <div className="space-y-3 mb-6">
              <div className="flex justify-between text-sm">
                <span className="text-slate-400">Items ({cart.length})</span>
                <span className="text-white">₹{cartTotal.toLocaleString()}</span>
              </div>
              <div className="flex justify-between text-sm">
                <span className="text-slate-400">Shipping</span>
                <span className={shipping === 0 ? "text-green-400 font-semibold" : "text-white"}>
                  {shipping === 0 ? "FREE" : `₹${shipping}`}
                </span>
              </div>
              {shipping > 0 && (
                <p className="text-xs text-slate-500">Add ₹{(999 - cartTotal).toLocaleString()} more for free shipping</p>
              )}
              <div className="border-t border-slate-700 pt-3 flex justify-between">
                <span className="text-white font-bold">Total</span>
                <span className="text-primary font-bold text-xl">₹{grandTotal.toLocaleString()}</span>
              </div>
            </div>

            <button onClick={() => navigate("/checkout")} className="btn-primary w-full py-3 text-base">
              Proceed to Checkout →
            </button>
          </div>
        </aside>
      </div>
    </div>
  );
}
