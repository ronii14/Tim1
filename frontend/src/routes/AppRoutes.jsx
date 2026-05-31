import { BrowserRouter, Routes, Route, Navigate, Outlet } from 'react-router-dom';
import AuthLayout from '../layouts/auth/AuthLayout';
import AdminLayout from '../layouts/admin/AdminLayout';
import CustomerLayout from '../layouts/customer/CustomerLayout';
import LandingPage from '../pages/landing/LandingPage';
import LoginPage from '../pages/auth/LoginPage';
import RegisterPage from '../pages/auth/RegisterPage';
import DashboardPage from '../pages/admin/dashboard/DashboardPage';
import ProfilePage from '../pages/admin/profile/ProfilePage';
import RolesPage from '../pages/admin/roles/RolesPage';
import PermissionsPage from '../pages/admin/permissions/PermissionsPage';
import UsersPage from '../pages/admin/users/UsersPage';
import CustomerHomePage from '../pages/customer/CustomerHomePage';
import ProdukPage from '../pages/admin/product/ProdukPage';

// Products
import ProductListPage from '../pages/product/ProductListPage';
import ProductFormPage from '../pages/product/ProductFormPage';
import ProductDetailPage from '../pages/product/ProductDetailPage';

// Categories
import CategoryListPage from '../pages/categories/CategoryListPage';
import CategoryFormPage from '../pages/categories/CategoryFormPage';

function getUserRole() {
  const user = JSON.parse(localStorage.getItem('user') || '{}');
  const roles = user?.roles || [];
  if (roles.includes('admin')) return 'admin';
  if (roles.length > 0) return 'user';
  return null;
}

function GuestRoute() {
  const token = localStorage.getItem('token');
  if (!token) return <Outlet />;
  const role = getUserRole();
  return <Navigate to={role === 'admin' ? '/admin/dashboard' : '/customer'} replace />;
}

function AdminRoute() {
  const token = localStorage.getItem('token');
  if (!token) return <Navigate to="/login" replace />;
  const role = getUserRole();
  if (role !== 'admin') return <Navigate to="/customer" replace />;
  return <Outlet />;
}

function CustomerRoute() {
  const token = localStorage.getItem('token');
  if (!token) return <Navigate to="/login" replace />;
  return <Outlet />;
}

export default function AppRoutes() {
  return (
    <BrowserRouter>
      <Routes>

        {/* Landing page publik */}
        <Route path="/" element={<LandingPage />} />

        {/* Auth — hanya guest */}
        <Route element={<GuestRoute />}>
          <Route element={<AuthLayout />}>
            <Route path="/login"    element={<LoginPage />} />
            <Route path="/register" element={<RegisterPage />} />
          </Route>
        </Route>

        {/* Customer routes */}
        <Route element={<CustomerRoute />}>
          <Route element={<CustomerLayout />}>
            <Route path="/customer"      element={<CustomerHomePage />} />
            <Route path="/products"      element={<ProductListPage />} />
            <Route path="/products/:id"  element={<ProductDetailPage />} />
          </Route>
        </Route>

        {/* Admin routes */}
        <Route element={<AdminRoute />}>
          <Route element={<AdminLayout />}>
            <Route path="/admin/dashboard"            element={<DashboardPage />} />
            <Route path="/admin/profile"              element={<ProfilePage />} />
            <Route path="/admin/roles"                element={<RolesPage />} />
            <Route path="/admin/permissions"          element={<PermissionsPage />} />
            <Route path="/admin/users"                element={<UsersPage />} />
            <Route path="/admin/products/create"      element={<ProductFormPage />} />
            <Route path="/admin/products/edit/:id"    element={<ProductFormPage />} />
            <Route path="dashboard"                   element={<DashboardPage />} />
            <Route path="/admin/product"              element={<ProdukPage />} />
            <Route path="profile"                     element={<ProfilePage />} />
            <Route path="/admin/categories"           element={<CategoryListPage />} />
            <Route path="/admin/categories/create"    element={<CategoryFormPage />} />
            <Route path="/admin/categories/:id/edit"  element={<CategoryFormPage />} />
          </Route>
        </Route>

        {/* Catch all */}
        <Route path="*" element={<Navigate to="/" replace />} />

      </Routes>
    </BrowserRouter>
  );
}