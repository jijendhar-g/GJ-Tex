import { Routes, Route } from 'react-router-dom';
import Home from '../pages/Home';
import Products from '../pages/Products';
import ProductDetail from '../pages/ProductDetail';
import BulkOrder from '../pages/BulkOrder';
import Cart from '../pages/Cart';
import Checkout from '../pages/Checkout';
import Login from '../pages/Login';
import Register from '../pages/Register';
import ForgotPassword from '../pages/ForgotPassword';
import ResetPassword from '../pages/ResetPassword';
import MyAccount from '../pages/MyAccount';
import Dashboard from '../pages/Dashboard';
import AdminDashboard from '../pages/admin/AdminDashboard';
import PrivateRoute from './PrivateRoute';
import AdminRoute from './AdminRoute';

const AppRoutes = () => {
    return (
        <Routes>
            <Route path="/" element={<Home />} />
            <Route path="/products" element={<Products />} />
            <Route path="/products/:id" element={<ProductDetail />} />
            <Route path="/bulk-order" element={<BulkOrder />} />
            <Route path="/cart" element={<Cart />} />
            <Route path="/login" element={<Login />} />
            <Route path="/register" element={<Register />} />
            <Route path="/forgot-password" element={<ForgotPassword />} />
            <Route path="/reset-password/:token" element={<ResetPassword />} />

            {/* Protected User Routes */}
            <Route element={<PrivateRoute />}>
                <Route path="/dashboard" element={<Dashboard />} />
                <Route path="/checkout" element={<Checkout />} />
                <Route path="/profile" element={<MyAccount />} />
            </Route>

            {/* Protected Admin Routes */}
            <Route element={<AdminRoute />}>
                <Route path="/admin" element={<AdminDashboard />} />
            </Route>
        </Routes>
    );
};

export default AppRoutes;
