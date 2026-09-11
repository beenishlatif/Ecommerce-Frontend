import { Routes, Route } from 'react-router-dom';

import MainLayout from './components/MainLayout.jsx';
import AuthLayout from './components/AuthLayout.jsx';
import AdminLayout from './components/AdminLayout.jsx';
import { ProtectedRoute, AdminProtectedRoute } from './components/ProtectedRoute.jsx';

// Customer pages
import Home from './pages/Home.jsx';
import Shop from './pages/Shop.jsx';
import ProductDetails from './pages/ProductDetails.jsx';
import Categories from './pages/Categories.jsx';
import CategoryDetails from './pages/CategoryDetails.jsx';
import Search from './pages/Search.jsx';
import Cart from './pages/Cart.jsx';
import Checkout from './pages/Checkout.jsx';
import Wishlist from './pages/Wishlist.jsx';
import Login from './pages/Login.jsx';
import Register from './pages/Register.jsx';
import ForgotPassword from './pages/ForgotPassword.jsx';
import ResetPassword from './pages/ResetPassword.jsx';
import Profile from './pages/Profile.jsx';
import EditProfile from './pages/EditProfile.jsx';
import Addresses from './pages/Addresses.jsx';
import Orders from './pages/Orders.jsx';
import OrderDetails from './pages/OrderDetails.jsx';
import About from './pages/About.jsx';
import Contact from './pages/Contact.jsx';
import FAQ from './pages/FAQ.jsx';
import PrivacyPolicy from './pages/legal/PrivacyPolicy.jsx';
import Terms from './pages/legal/Terms.jsx';
import ShippingPolicy from './pages/legal/ShippingPolicy.jsx';
import ReturnPolicy from './pages/legal/ReturnPolicy.jsx';
import NotFound from './pages/NotFound.jsx';

// Admin pages
import AdminLogin from './pages/admin/AdminLogin.jsx';
import Dashboard from './pages/admin/Dashboard.jsx';
import AdminProducts from './pages/admin/Products.jsx';
import ProductForm from './pages/admin/ProductForm.jsx';
import AdminCategories from './pages/admin/Categories.jsx';
import AdminOrders from './pages/admin/Orders.jsx';
import AdminOrderDetails from './pages/admin/AdminOrderDetails.jsx';
import Customers from './pages/admin/Customers.jsx';
import AdminUsers from './pages/admin/AdminUsers.jsx';
import Coupons from './pages/admin/Coupons.jsx';
import Payments from './pages/admin/Payments.jsx';
import Reviews from './pages/admin/Reviews.jsx';
import Inventory from './pages/admin/Inventory.jsx';
import Settings from './pages/admin/Settings.jsx';
import AdminProfile from './pages/admin/AdminProfile.jsx';
import AdminNotFound from './pages/admin/AdminNotFound.jsx';


export default function App() {
  return (
    <Routes>
      {/* Customer-facing site */}
      <Route element={<MainLayout />}>
        <Route path="/" element={<Home />} />
        <Route path="/shop" element={<Shop />} />
        <Route path="/product/:slug" element={<ProductDetails />} />
        <Route path="/categories" element={<Categories />} />
        <Route path="/categories/:slug" element={<CategoryDetails />} />
        <Route path="/search" element={<Search />} />
        <Route path="/cart" element={<Cart />} />
        <Route path="/checkout" element={<Checkout />} />
        <Route path="/orders/:id" element={<OrderDetails />} />
        <Route path="/about" element={<About />} />
        <Route path="/contact" element={<Contact />} />
        <Route path="/faq" element={<FAQ />} />
        <Route path="/privacy-policy" element={<PrivacyPolicy />} />
        <Route path="/terms" element={<Terms />} />
        <Route path="/shipping-policy" element={<ShippingPolicy />} />
        <Route path="/return-policy" element={<ReturnPolicy />} />

        {/* Customer protected routes — still require login */}
        <Route element={<ProtectedRoute />}>
          <Route path="/wishlist" element={<Wishlist />} />
          <Route path="/profile" element={<Profile />} />
          <Route path="/profile/edit" element={<EditProfile />} />
          <Route path="/addresses" element={<Addresses />} />
          <Route path="/orders" element={<Orders />} />
        </Route>

        <Route path="*" element={<NotFound />} />
      </Route>

      {/* Auth pages (login/register share AuthLayout) */}
      <Route element={<AuthLayout title="Welcome back" subtitle="Sign in to your account" />}>
        <Route path="/login" element={<Login />} />
      </Route>
      <Route element={<AuthLayout title="Create an account" subtitle="Join Lumière today" />}>
        <Route path="/register" element={<Register />} />
      </Route>
      <Route element={<AuthLayout title="Forgot Password" subtitle="We'll send you a reset link" />}>
        <Route path="/forgot-password" element={<ForgotPassword />} />
      </Route>
      <Route element={<AuthLayout title="Reset Password" subtitle="Choose a new password" />}>
        <Route path="/reset-password" element={<ResetPassword />} />
      </Route>

      {/* Admin */}
      <Route path="/admin/login" element={<AdminLogin />} />
      <Route element={<AdminProtectedRoute />}>
        <Route element={<AdminLayout />}>
          <Route path="/admin/dashboard" element={<Dashboard />} />
          <Route path="/admin/products" element={<AdminProducts />} />
          <Route path="/admin/products/new" element={<ProductForm />} />
          <Route path="/admin/products/:id/edit" element={<ProductForm />} />
          <Route path="/admin/categories" element={<AdminCategories />} />
          <Route path="/admin/orders" element={<AdminOrders />} />
          <Route path="/admin/orders/:id" element={<AdminOrderDetails />} />
          <Route path="/admin/customers" element={<Customers />} />
          <Route path="/admin/users" element={<AdminUsers />} />
          <Route path="/admin/coupons" element={<Coupons />} />
          <Route path="/admin/payments" element={<Payments />} />
          <Route path="/admin/reviews" element={<Reviews />} />
          <Route path="/admin/inventory" element={<Inventory />} />
          <Route path="/admin/settings" element={<Settings />} />
          <Route path="/admin/profile" element={<AdminProfile />} />
          <Route path="*" element={<AdminNotFound />} />
        </Route>
      </Route>
    </Routes>
  );
}