import { BrowserRouter, Routes, Route } from "react-router-dom";
import Layout from "../components/Layout";
import { ProtectedRoute, AdminRoute } from "../components/ProtectedRoute";

import Home from "../pages/Home";
import Products from "../pages/Products";
import ProductDetails from "../pages/ProductDetails";
import Cart from "../pages/Cart";
import Login from "../pages/Login";
import Register from "../pages/Register";
import Checkout from "../pages/Checkout";
import MyOrders from "../pages/MyOrders";

import AdminDashboard from "../admin/Dashboard";
import AdminProducts from "../admin/Products";
import AdminOrders from "../admin/Orders";
import AdminUsers from "../admin/Users";

export default function AppRouter() {
  return (
    <BrowserRouter>
      <Routes>
        {/* Public */}
        <Route path="/" element={<Layout><Home /></Layout>} />
        <Route path="/products" element={<Layout><Products /></Layout>} />
        <Route path="/products/:id" element={<Layout><ProductDetails /></Layout>} />
        <Route path="/login" element={<Layout><Login /></Layout>} />
        <Route path="/register" element={<Layout><Register /></Layout>} />

        {/* Protected */}
        <Route path="/cart" element={<Layout><Cart /></Layout>} />
        <Route path="/checkout" element={<ProtectedRoute><Layout><Checkout /></Layout></ProtectedRoute>} />
        <Route path="/my-orders" element={<ProtectedRoute><Layout><MyOrders /></Layout></ProtectedRoute>} />

        {/* Admin */}
        <Route path="/admin" element={<AdminRoute><AdminDashboard /></AdminRoute>} />
        <Route path="/admin/products" element={<AdminRoute><AdminProducts /></AdminRoute>} />
        <Route path="/admin/orders" element={<AdminRoute><AdminOrders /></AdminRoute>} />
        <Route path="/admin/users" element={<AdminRoute><AdminUsers /></AdminRoute>} />

        {/* 404 */}
        <Route path="*" element={
          <Layout>
            <div className="min-h-[60vh] flex flex-col items-center justify-center text-center gap-4">
              <div className="text-8xl font-black text-primary/20">404</div>
              <h1 className="text-2xl font-bold text-white">Page Not Found</h1>
              <a href="/" className="btn-primary">Go Home</a>
            </div>
          </Layout>
        } />
      </Routes>
    </BrowserRouter>
  );
}
