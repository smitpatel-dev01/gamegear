import { useEffect, useState } from "react";
import api from "../api/api";
import AdminLayout from "./AdminLayout";
import { Spinner } from "../components/ProtectedRoute";

const EMPTY_FORM = {
  name: "",
  brand: "",
  category: "Mouse",
  description: "",
  price: "",
  discountPrice: "",
  stock: "",
  isFeatured: false,
};
const CATEGORIES = ["Mouse", "Keyboard", "Headset", "Monitor", "Controller"];

export default function AdminProducts() {
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [editProduct, setEditProduct] = useState(null);
  const [form, setForm] = useState(EMPTY_FORM);
  const [images, setImages] = useState([]);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [total, setTotal] = useState(0);

  useEffect(() => {
    fetchProducts();
  }, [page]);

  const fetchProducts = async () => {
    setLoading(true);
    try {
      const res = await api.get(`/products/admin/all?page=${page}&limit=10`);
      setProducts(res.data.products);
      setTotalPages(res.data.totalPages);
      setTotal(res.data.total);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const openAdd = () => {
    setEditProduct(null);
    setForm(EMPTY_FORM);
    setImages([]);
    setError("");
    setShowModal(true);
  };
  const openEdit = (p) => {
    setEditProduct(p);
    setForm({
      name: p.name,
      brand: p.brand,
      category: p.category,
      description: p.description || "",
      price: p.price,
      discountPrice: p.discountPrice || "",
      stock: p.stock,
      isFeatured: p.isFeatured,
    });
    setImages([]);
    setError("");
    setShowModal(true);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSaving(true);
    setError("");
    try {
      const formData = new FormData();
      Object.entries(form).forEach(([k, v]) => formData.append(k, v));
      images.forEach((file) => formData.append("images", file));

      if (editProduct) {
        await api.put(`/products/${editProduct._id}`, formData, {
          headers: { "Content-Type": "multipart/form-data" },
        });
      } else {
        await api.post("/products", formData, {
          headers: { "Content-Type": "multipart/form-data" },
        });
      }
      setShowModal(false);
      fetchProducts();
    } catch (err) {
      setError(err?.response?.data?.message || "Save failed");
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async (id) => {
    if (!confirm("Deactivate this product?")) return;
    try {
      await api.delete(`/products/${id}`);
      fetchProducts();
    } catch (err) {
      alert("Failed to delete");
    }
  };

  const handleActivate = async (id) => {
    if (!confirm("Activate this product?")) return;
    try {
      await api.put(`/products/${id}`, { isActive: true });
      fetchProducts();
    } catch (err) {
      alert("Failed to activate");
    }
  };
  return (
    <AdminLayout>
      <div className="p-8">
        {/* Header */}
        <div className="flex items-center justify-between mb-8">
          <div>
            <h1 className="text-3xl font-bold text-white">Product Inventory</h1>
            <p className="text-slate-400 mt-1">
              Track stock levels, manage pricing and availability
            </p>
          </div>
          <button
            onClick={openAdd}
            className="btn-primary flex items-center gap-2"
          >
            + Add New Product
          </button>
        </div>

        {/* Stats row */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
          {[
            { label: "Total Products", value: total, color: "text-white" },
            {
              label: "Out of Stock",
              value: products.filter((p) => p.stock === 0).length,
              color: "text-red-400",
            },
            {
              label: "Low Stock (≤5)",
              value: products.filter((p) => p.stock > 0 && p.stock <= 5).length,
              color: "text-yellow-400",
            },
            {
              label: "Active",
              value: products.filter((p) => p.isActive).length,
              color: "text-green-400",
            },
          ].map((s) => (
            <div key={s.label} className="card p-4">
              <p className="text-slate-400 text-xs mb-1">{s.label}</p>
              <p className={`text-2xl font-bold ${s.color}`}>{s.value}</p>
            </div>
          ))}
        </div>

        {/* Table */}
        <div className="card overflow-hidden">
          {loading ? (
            <div className="flex justify-center py-16">
              <Spinner size="lg" />
            </div>
          ) : (
            <>
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead className="bg-primary/5 border-b border-slate-800">
                    <tr className="text-xs uppercase text-slate-400 font-bold tracking-wider">
                      <th className="px-6 py-4 text-left">Image</th>
                      <th className="px-6 py-4 text-left">Product Name</th>
                      <th className="px-6 py-4 text-left">Category</th>
                      <th className="px-6 py-4 text-left">Price</th>
                      <th className="px-6 py-4 text-left">Stock Status</th>
                      <th className="px-6 py-4 text-left">Status</th>
                      <th className="px-6 py-4 text-right">Actions</th>
                    </tr>
                  </thead>
                  <tbody>
                    {products.map((p) => (
                      <tr
                        key={p._id}
                        className="border-b border-slate-800 hover:bg-primary/5 transition-colors"
                      >
                        <td className="px-6 py-4">
                          <img
                            src={
                              p.images?.[0]?.url ||
                              "https://placehold.co/48x48/111f28/06a8f9?text=GG"
                            }
                            alt={p.name}
                            className="w-12 h-12 rounded-lg object-cover bg-bg-card2"
                          />
                        </td>
                        <td className="px-6 py-4">
                          <p className="text-white font-semibold text-sm">
                            {p.name}
                          </p>
                          <p className="text-slate-500 text-xs">{p.brand}</p>
                        </td>
                        <td className="px-6 py-4">
                          <span className="badge bg-primary/10 text-primary border border-primary/20">
                            {p.category}
                          </span>
                        </td>
                        <td className="px-6 py-4">
                          <p className="text-white font-semibold text-sm">
                            ₹{p.price?.toLocaleString()}
                          </p>
                          {p.discountPrice && (
                            <p className="text-green-400 text-xs">
                              Sale: ₹{p.discountPrice?.toLocaleString()}
                            </p>
                          )}
                        </td>
                        <td className="px-6 py-4">
                          {p.stock === 0 ? (
                            <span className="badge bg-red-500/20 text-red-400 border border-red-500/20">
                              Out of Stock
                            </span>
                          ) : p.stock <= 5 ? (
                            <span className="badge bg-yellow-500/20 text-yellow-400 border border-yellow-500/20">
                              Low Stock ({p.stock})
                            </span>
                          ) : (
                            <span className="badge bg-green-500/20 text-green-400 border border-green-500/20">
                              In Stock ({p.stock})
                            </span>
                          )}
                        </td>
                        <td className="px-6 py-4">
                          <span
                            className={`badge ${p.isActive ? "bg-green-500/10 text-green-400" : "bg-slate-700 text-slate-400"}`}
                          >
                            {p.isActive ? "Active" : "Inactive"}
                          </span>
                        </td>
                        <td className="px-6 py-4 text-right">
                          <div className="flex gap-2 justify-end">
                            <button
                              onClick={() => openEdit(p)}
                              className="text-xs text-primary hover:text-white bg-primary/10 hover:bg-primary/20 px-3 py-1.5 rounded-lg transition-colors"
                            >
                              Edit
                            </button>
                            {p.isActive ? (
                              <button
                                onClick={() => handleDelete(p._id)}
                                className="text-xs text-red-400 hover:text-white bg-red-500/10 hover:bg-red-500/20 px-3 py-1.5 rounded-lg transition-colors"
                              >
                                Deactivate
                              </button>
                            ) : (
                              <button
                                onClick={() => handleActivate(p._id)}
                                className="text-xs text-green-400 hover:text-white bg-green-500/10 hover:bg-green-500/20 px-3 py-1.5 rounded-lg transition-colors"
                              >
                                Activate
                              </button>
                            )}
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>

              {/* Pagination */}
              {totalPages > 1 && (
                <div className="flex justify-between items-center px-6 py-4 border-t border-slate-800">
                  <p className="text-slate-400 text-sm">
                    Showing page {page} of {totalPages}
                  </p>
                  <div className="flex gap-2">
                    <button
                      onClick={() => setPage((p) => p - 1)}
                      disabled={page === 1}
                      className="px-3 py-1.5 border border-slate-700 rounded-lg text-sm text-slate-400 hover:border-primary hover:text-primary disabled:opacity-40"
                    >
                      ← Prev
                    </button>
                    <button
                      onClick={() => setPage((p) => p + 1)}
                      disabled={page === totalPages}
                      className="px-3 py-1.5 border border-slate-700 rounded-lg text-sm text-slate-400 hover:border-primary hover:text-primary disabled:opacity-40"
                    >
                      Next →
                    </button>
                  </div>
                </div>
              )}
            </>
          )}
        </div>
      </div>

      {/* Modal */}
      {showModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 p-4">
          <div className="bg-bg-card border border-slate-700 rounded-2xl w-full max-w-2xl max-h-[90vh] overflow-y-auto">
            <div className="flex justify-between items-center p-6 border-b border-slate-800">
              <h2 className="text-white font-bold text-xl">
                {editProduct ? "Edit Product" : "Add New Product"}
              </h2>
              <button
                onClick={() => setShowModal(false)}
                className="text-slate-400 hover:text-white text-xl"
              >
                ✕
              </button>
            </div>

            <form onSubmit={handleSubmit} className="p-6 space-y-4">
              {error && (
                <div className="bg-red-500/10 border border-red-500/20 text-red-400 text-sm px-4 py-3 rounded-lg">
                  {error}
                </div>
              )}

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="text-slate-400 text-sm mb-1.5 block">
                    Product Name *
                  </label>
                  <input
                    required
                    value={form.name}
                    onChange={(e) => setForm({ ...form, name: e.target.value })}
                    className="input-field"
                    placeholder="Viper X Pro"
                  />
                </div>
                <div>
                  <label className="text-slate-400 text-sm mb-1.5 block">
                    Brand *
                  </label>
                  <input
                    required
                    value={form.brand}
                    onChange={(e) =>
                      setForm({ ...form, brand: e.target.value })
                    }
                    className="input-field"
                    placeholder="Razer"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="text-slate-400 text-sm mb-1.5 block">
                    Category *
                  </label>
                  <select
                    required
                    value={form.category}
                    onChange={(e) =>
                      setForm({ ...form, category: e.target.value })
                    }
                    className="input-field"
                  >
                    {CATEGORIES.map((c) => (
                      <option key={c} value={c}>
                        {c}
                      </option>
                    ))}
                  </select>
                </div>
                <div>
                  <label className="text-slate-400 text-sm mb-1.5 block">
                    Stock *
                  </label>
                  <input
                    required
                    type="number"
                    min="0"
                    value={form.stock}
                    onChange={(e) =>
                      setForm({ ...form, stock: e.target.value })
                    }
                    className="input-field"
                    placeholder="100"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="text-slate-400 text-sm mb-1.5 block">
                    Price (₹) *
                  </label>
                  <input
                    required
                    type="number"
                    min="0"
                    step="0.01"
                    value={form.price}
                    onChange={(e) =>
                      setForm({ ...form, price: e.target.value })
                    }
                    className="input-field"
                    placeholder="4999"
                  />
                </div>
                <div>
                  <label className="text-slate-400 text-sm mb-1.5 block">
                    Discount Price (₹)
                  </label>
                  <input
                    type="number"
                    min="0"
                    step="0.01"
                    value={form.discountPrice}
                    onChange={(e) =>
                      setForm({ ...form, discountPrice: e.target.value })
                    }
                    className="input-field"
                    placeholder="Optional"
                  />
                </div>
              </div>

              <div>
                <label className="text-slate-400 text-sm mb-1.5 block">
                  Description
                </label>
                <textarea
                  value={form.description}
                  onChange={(e) =>
                    setForm({ ...form, description: e.target.value })
                  }
                  className="input-field h-24 resize-none"
                  placeholder="Product description..."
                />
              </div>

              <div>
                <label className="text-slate-400 text-sm mb-1.5 block">
                  Product Images (max 5)
                </label>
                <input
                  type="file"
                  multiple
                  accept="image/*"
                  onChange={(e) => setImages(Array.from(e.target.files))}
                  className="w-full text-sm text-slate-400 file:mr-4 file:py-2 file:px-4 file:rounded-lg file:border-0 file:bg-primary/20 file:text-primary hover:file:bg-primary/30 cursor-pointer"
                />
                {editProduct?.images?.length > 0 && (
                  <div className="flex gap-2 mt-2">
                    {editProduct.images.map((img, i) => (
                      <img
                        key={i}
                        src={img.url}
                        alt=""
                        className="w-12 h-12 rounded-lg object-cover border border-slate-700"
                      />
                    ))}
                    <p className="text-slate-500 text-xs self-center">
                      Upload new images to replace
                    </p>
                  </div>
                )}
              </div>

              <label className="flex items-center gap-3 cursor-pointer">
                <input
                  type="checkbox"
                  checked={form.isFeatured}
                  onChange={(e) =>
                    setForm({ ...form, isFeatured: e.target.checked })
                  }
                  className="w-4 h-4 accent-primary"
                />
                <span className="text-slate-300 text-sm">
                  Mark as Featured Product
                </span>
              </label>

              <div className="flex gap-3 pt-2">
                <button
                  type="button"
                  onClick={() => setShowModal(false)}
                  className="btn-outline flex-1"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={saving}
                  className="btn-primary flex-1 disabled:opacity-60"
                >
                  {saving
                    ? "Saving..."
                    : editProduct
                      ? "Update Product"
                      : "Add Product"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </AdminLayout>
  );
}
