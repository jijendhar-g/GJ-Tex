import { useState, useEffect, useContext } from 'react';
import axios from 'axios';
import { AuthContext } from '../../context/AuthContext';
import {
    LayoutDashboard, Package, ShoppingBag, Users, FolderOpen,
    Plus, Trash2, Edit3, X, Check, ChevronDown, ArrowUpRight,
    Clock, CheckCircle, XCircle, AlertCircle, TrendingUp, Megaphone, Eye, EyeOff, Upload, ImagePlus,
    IndianRupee, Calendar, BarChart3
} from 'lucide-react';
import { AreaChart, Area, BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, PieChart, Pie, Cell, Legend, ComposedChart, Line } from 'recharts';

const API = 'http://localhost:5000/api';

const AdminDashboard = () => {
    const { user } = useContext(AuthContext);
    const [activeTab, setActiveTab] = useState('overview');
    const [stats, setStats] = useState({});
    const [orders, setOrders] = useState([]);
    const [products, setProducts] = useState([]);
    const [users, setUsers] = useState([]);
    const [categories, setCategories] = useState([]);
    const [ads, setAds] = useState([]);
    const [analytics, setAnalytics] = useState(null);
    const [loading, setLoading] = useState(true);

    // Modal states
    const [showProductModal, setShowProductModal] = useState(false);
    const [showCategoryModal, setShowCategoryModal] = useState(false);
    const [showAdModal, setShowAdModal] = useState(false);
    const [editingProduct, setEditingProduct] = useState(null);
    const [editingCategory, setEditingCategory] = useState(null);
    const [editingAd, setEditingAd] = useState(null);
    const [productGenderFilter, setProductGenderFilter] = useState('All');

    const config = { headers: { Authorization: `Bearer ${user.token}` } };

    const fetchAll = async () => {
        try {
            setLoading(true);
            const [statsRes, ordersRes, productsRes, usersRes, categoriesRes, adsRes, analyticsRes] = await Promise.all([
                axios.get(`${API}/admin/stats`, config),
                axios.get(`${API}/orders`, config),
                axios.get(`${API}/products`),
                axios.get(`${API}/admin/users`, config),
                axios.get(`${API}/admin/categories`, config),
                axios.get(`${API}/admin/ads`, config),
                axios.get(`${API}/admin/analytics`, config)
            ]);
            setStats(statsRes.data);
            setOrders(ordersRes.data);
            setProducts(productsRes.data.products || productsRes.data);
            setUsers(usersRes.data);
            setCategories(categoriesRes.data);
            setAds(adsRes.data);
            setAnalytics(analyticsRes.data);
            setLoading(false);
        } catch (error) {
            console.error('Failed to fetch admin data', error);
            setLoading(false);
        }
    };

    useEffect(() => { fetchAll(); }, []);

    // ═══════════════ ORDER STATUS UPDATE ═══════════════
    const updateOrderStatus = async (id, newStatus) => {
        try {
            await axios.put(`${API}/orders/${id}/status`, { status: newStatus }, config);
            fetchAll();
        } catch (error) {
            alert('Failed to update status');
        }
    };

    // ═══════════════ DELETE PRODUCT ═══════════════
    const deleteProduct = async (id) => {
        if (!window.confirm('Are you sure you want to delete this product?')) return;
        try {
            await axios.delete(`${API}/products/${id}`, config);
            fetchAll();
        } catch (error) {
            alert('Failed to delete product');
        }
    };

    // ═══════════════ DELETE USER ═══════════════
    const deleteUser = async (id) => {
        if (!window.confirm('Are you sure you want to delete this user?')) return;
        try {
            await axios.delete(`${API}/admin/users/${id}`, config);
            fetchAll();
        } catch (error) {
            alert(error.response?.data?.message || 'Failed to delete user');
        }
    };

    // ═══════════════ DELETE CATEGORY ═══════════════
    const deleteCategory = async (id) => {
        if (!window.confirm('Delete this category?')) return;
        try {
            await axios.delete(`${API}/admin/categories/${id}`, config);
            fetchAll();
        } catch (error) {
            alert('Failed to delete category');
        }
    };

    // Ad helpers
    const deleteAd = async (id) => {
        if (!window.confirm('Delete this ad?')) return;
        try {
            await axios.delete(`${API}/admin/ads/${id}`, config);
            fetchAll();
        } catch (error) {
            alert('Failed to delete ad');
        }
    };

    const toggleAdActive = async (ad) => {
        try {
            await axios.put(`${API}/admin/ads/${ad._id}`, { ...ad, isActive: !ad.isActive }, config);
            fetchAll();
        } catch (error) {
            alert('Failed to update ad');
        }
    };

    // Revenue view state
    const [revenueView, setRevenueView] = useState('daily');

    // Sidebar items
    const tabs = [
        { id: 'overview', label: 'Overview', icon: LayoutDashboard },
        { id: 'revenue', label: 'Revenue', icon: IndianRupee },
        { id: 'orders', label: 'Orders', icon: ShoppingBag, badge: stats.pendingOrders },
        { id: 'products', label: 'Products', icon: Package },
        { id: 'categories', label: 'Categories', icon: FolderOpen },
        { id: 'users', label: 'Users', icon: Users },
        { id: 'ads', label: 'Ads & Offers', icon: Megaphone },
    ];

    const statusColors = {
        Pending: 'bg-amber-50 text-amber-700 border-amber-200',
        Processing: 'bg-blue-50 text-blue-700 border-blue-200',
        Completed: 'bg-green-50 text-green-700 border-green-200',
        Cancelled: 'bg-red-50 text-red-700 border-red-200'
    };

    const statusIcons = {
        Pending: Clock,
        Processing: TrendingUp,
        Completed: CheckCircle,
        Cancelled: XCircle
    };

    if (loading) return (
        <div className="min-h-screen flex items-center justify-center bg-gray-50 pt-20">
            <div className="w-14 h-14 border-4 border-gray-200 border-t-brand rounded-full animate-spin"></div>
        </div>
    );

    return (
        <div className="min-h-screen bg-gray-50 pt-20">
            <div className="max-w-[1400px] mx-auto px-4 sm:px-6 lg:px-8 py-8">
                <div className="flex flex-col lg:flex-row gap-8">

                    {/* ═══════════════ SIDEBAR ═══════════════ */}
                    <div className="lg:w-64 flex-shrink-0">
                        <div className="bg-white rounded-2xl border border-gray-100 shadow-card p-4 lg:sticky lg:top-28">
                            <div className="px-3 py-4 border-b border-gray-100 mb-4">
                                <p className="font-display font-bold text-dark text-lg">Admin Panel</p>
                                <p className="text-xs text-gray-400 mt-0.5">{user.email}</p>
                            </div>
                            <nav className="space-y-1">
                                {tabs.map(tab => {
                                    const Icon = tab.icon;
                                    return (
                                        <button
                                            key={tab.id}
                                            onClick={() => setActiveTab(tab.id)}
                                            className={`w-full flex items-center gap-3 px-4 py-2.5 rounded-xl text-sm font-medium transition-all duration-200 ${activeTab === tab.id
                                                ? 'bg-gradient-to-r from-orange-500 to-red-500 text-white shadow-md shadow-orange-200'
                                                : 'text-gray-600 hover:bg-gray-50 hover:text-dark'
                                                }`}
                                        >
                                            <Icon size={18} />
                                            {tab.label}
                                            {tab.badge > 0 && (
                                                <span className={`ml-auto text-xs font-bold px-2 py-0.5 rounded-full ${activeTab === tab.id ? 'bg-white/20 text-white' : 'bg-red-100 text-red-600'
                                                    }`}>
                                                    {tab.badge}
                                                </span>
                                            )}
                                        </button>
                                    );
                                })}
                            </nav>
                        </div>
                    </div>

                    {/* ═══════════════ MAIN CONTENT ═══════════════ */}
                    <div className="flex-1 min-w-0">

                        {/* ───── OVERVIEW TAB ───── */}
                        {activeTab === 'overview' && (
                            <div className="space-y-8">
                                <div>
                                    <h1 className="text-3xl font-bold text-dark font-display">Dashboard Overview</h1>
                                    <p className="text-gray-500 mt-1">Welcome back, {user.name}!</p>
                                </div>

                                {/* Stats Grid */}
                                <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
                                    {[
                                        { label: 'Total Orders', value: stats.totalOrders || 0, icon: ShoppingBag, color: 'from-blue-500 to-blue-600', bg: 'bg-blue-50' },
                                        { label: 'Pending', value: stats.pendingOrders || 0, icon: Clock, color: 'from-amber-500 to-amber-600', bg: 'bg-amber-50' },
                                        { label: 'Products', value: stats.totalProducts || 0, icon: Package, color: 'from-green-500 to-green-600', bg: 'bg-green-50' },
                                        { label: 'Customers', value: stats.totalUsers || 0, icon: Users, color: 'from-purple-500 to-purple-600', bg: 'bg-purple-50' },
                                    ].map((stat, idx) => (
                                        <div key={idx} className="bg-white p-6 rounded-2xl border border-gray-100 shadow-card hover:shadow-card-hover transition-shadow">
                                            <div className={`w-12 h-12 bg-gradient-to-br ${stat.color} rounded-xl flex items-center justify-center text-white mb-4 shadow-sm`}>
                                                <stat.icon size={22} />
                                            </div>
                                            <p className="text-3xl font-bold text-dark font-display">{stat.value}</p>
                                            <p className="text-sm text-gray-500 font-medium mt-1">{stat.label}</p>
                                        </div>
                                    ))}
                                </div>

                                {/* Charts Row */}
                                {analytics && (
                                    <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                                        {/* Revenue Area Chart */}
                                        <div className="lg:col-span-2 bg-white rounded-2xl border border-gray-100 shadow-card p-6">
                                            <div className="flex items-center justify-between mb-4">
                                                <div>
                                                    <h3 className="font-bold text-dark font-display text-lg">Revenue Trend</h3>
                                                    <p className="text-xs text-gray-400">Last 6 months (excl. cancelled)</p>
                                                </div>
                                                <button onClick={() => setActiveTab('revenue')} className="text-brand text-xs font-semibold hover:text-orange-600 flex items-center gap-1">
                                                    View Details <ArrowUpRight size={12} />
                                                </button>
                                            </div>
                                            <ResponsiveContainer width="100%" height={260}>
                                                <ComposedChart data={analytics.monthlyRevenue}>
                                                    <defs>
                                                        <linearGradient id="revGrad" x1="0" y1="0" x2="0" y2="1">
                                                            <stop offset="0%" stopColor="#f97316" stopOpacity={0.4} />
                                                            <stop offset="100%" stopColor="#f97316" stopOpacity={0.02} />
                                                        </linearGradient>
                                                    </defs>
                                                    <CartesianGrid strokeDasharray="3 3" stroke="#f3f4f6" vertical={false} />
                                                    <XAxis dataKey="month" tick={{ fontSize: 11, fill: '#9ca3af' }} axisLine={false} tickLine={false} />
                                                    <YAxis tick={{ fontSize: 11, fill: '#9ca3af' }} tickFormatter={v => `₹${(v / 1000).toFixed(0)}k`} axisLine={false} tickLine={false} />
                                                    <Tooltip formatter={(v, name) => [`₹${v.toLocaleString('en-IN')}`, name === 'revenue' ? 'Revenue' : 'Orders']} contentStyle={{ borderRadius: '16px', fontSize: '12px', border: '1px solid #e5e7eb', boxShadow: '0 10px 25px rgba(0,0,0,0.08)' }} />
                                                    <Area type="monotone" dataKey="revenue" stroke="#f97316" strokeWidth={3} fill="url(#revGrad)" dot={{ r: 4, fill: '#f97316', strokeWidth: 2, stroke: '#fff' }} />
                                                    <Line type="monotone" dataKey="orders" stroke="#8b5cf6" strokeWidth={2} strokeDasharray="5 5" dot={false} yAxisId={0} />
                                                </ComposedChart>
                                            </ResponsiveContainer>
                                        </div>

                                        {/* Status Pie */}
                                        <div className="bg-white rounded-2xl border border-gray-100 shadow-card p-6">
                                            <h3 className="font-bold text-dark font-display text-lg mb-1">Order Status</h3>
                                            <p className="text-xs text-gray-400 mb-2">Distribution breakdown</p>
                                            {analytics.totalRevenue !== undefined && (
                                                <div className="bg-gradient-to-br from-orange-50 to-amber-50 rounded-xl p-4 mb-4 border border-orange-100">
                                                    <p className="text-xs text-orange-600 font-semibold">Total Revenue</p>
                                                    <p className="text-2xl font-bold text-dark font-display">₹{analytics.totalRevenue?.toLocaleString('en-IN')}</p>
                                                </div>
                                            )}
                                            <ResponsiveContainer width="100%" height={200}>
                                                <PieChart>
                                                    <Pie data={analytics.statusBreakdown.map(s => ({ name: s._id, value: s.count }))} cx="50%" cy="45%" innerRadius={50} outerRadius={75} paddingAngle={4} dataKey="value" strokeWidth={0}>
                                                        {analytics.statusBreakdown.map((_, i) => (
                                                            <Cell key={i} fill={['#f97316', '#3b82f6', '#a855f7', '#10b981', '#ef4444'][i % 5]} />
                                                        ))}
                                                    </Pie>
                                                    <Tooltip contentStyle={{ borderRadius: '16px', fontSize: '12px', border: '1px solid #e5e7eb' }} />
                                                    <Legend iconType="circle" iconSize={8} wrapperStyle={{ fontSize: '11px', paddingTop: '8px' }} />
                                                </PieChart>
                                            </ResponsiveContainer>
                                        </div>

                                        {/* Top Products */}
                                        {analytics.topProducts?.length > 0 && (
                                            <div className="lg:col-span-3 bg-white rounded-2xl border border-gray-100 shadow-card p-6">
                                                <h3 className="font-bold text-dark font-display text-lg mb-1">Top Products by Quantity</h3>
                                                <p className="text-xs text-gray-400 mb-4">Total pieces ordered</p>
                                                <ResponsiveContainer width="100%" height={240}>
                                                    <BarChart data={analytics.topProducts} margin={{ left: 10 }} barSize={40}>
                                                        <defs>
                                                            <linearGradient id="barGrad" x1="0" y1="0" x2="0" y2="1">
                                                                <stop offset="0%" stopColor="#8b5cf6" stopOpacity={1} />
                                                                <stop offset="100%" stopColor="#6d28d9" stopOpacity={0.8} />
                                                            </linearGradient>
                                                        </defs>
                                                        <CartesianGrid strokeDasharray="3 3" stroke="#f3f4f6" vertical={false} />
                                                        <XAxis dataKey="name" tick={{ fontSize: 10, fill: '#6b7280' }} axisLine={false} tickLine={false} />
                                                        <YAxis tick={{ fontSize: 11, fill: '#9ca3af' }} axisLine={false} tickLine={false} />
                                                        <Tooltip formatter={(v) => [`${v.toLocaleString()} pcs`, 'Ordered']} contentStyle={{ borderRadius: '16px', fontSize: '12px', border: '1px solid #e5e7eb', boxShadow: '0 10px 25px rgba(0,0,0,0.08)' }} cursor={{ fill: 'rgba(139,92,246,0.06)' }} />
                                                        <Bar dataKey="totalQty" fill="url(#barGrad)" radius={[8, 8, 0, 0]} />
                                                    </BarChart>
                                                </ResponsiveContainer>
                                            </div>
                                        )}
                                    </div>
                                )}

                                {/* Recent Orders */}
                                <div className="bg-white rounded-2xl border border-gray-100 shadow-card overflow-hidden">
                                    <div className="p-6 border-b border-gray-100 flex justify-between items-center">
                                        <h2 className="font-display font-bold text-xl text-dark">Recent Orders</h2>
                                        <button onClick={() => setActiveTab('orders')} className="text-brand text-sm font-semibold hover:text-orange-600 flex items-center gap-1">
                                            View All <ArrowUpRight size={14} />
                                        </button>
                                    </div>
                                    <div className="overflow-x-auto">
                                        <table className="w-full text-left">
                                            <thead className="bg-gray-50 text-xs text-gray-500 uppercase tracking-wider">
                                                <tr>
                                                    <th className="p-4 font-medium">Customer</th>
                                                    <th className="p-4 font-medium">Products</th>
                                                    <th className="p-4 font-medium">Total Qty</th>
                                                    <th className="p-4 font-medium">Total Price</th>
                                                    <th className="p-4 font-medium">Status</th>
                                                    <th className="p-4 font-medium">Date</th>
                                                </tr>
                                            </thead>
                                            <tbody className="divide-y divide-gray-100">
                                                {orders.slice(0, 5).map(order => {
                                                    const StatusIcon = statusIcons[order.status] || Clock;
                                                    return (
                                                        <tr key={order._id} className="hover:bg-gray-50 transition-colors">
                                                            <td className="p-4">
                                                                <p className="font-semibold text-sm text-dark">{order.contactDetails?.name || order.user?.name || 'N/A'}</p>
                                                                <p className="text-xs text-gray-400">{order.contactDetails?.companyName || ''}</p>
                                                            </td>
                                                            <td className="p-4 text-sm text-gray-700">
                                                                {order.orderItems?.[0]?.product?.title || 'N/A'}
                                                                {order.orderItems?.length > 1 && <span className="text-gray-400 text-xs ml-2">+{order.orderItems.length - 1} more</span>}
                                                            </td>
                                                            <td className="p-4 text-sm font-medium text-dark">
                                                                {order.orderItems?.reduce((sum, item) => sum + item.quantity, 0) || 0}
                                                            </td>
                                                            <td className="p-4 text-sm font-bold text-dark">₹{order.totalPrice?.toLocaleString() || 0}</td>
                                                            <td className="p-4">
                                                                <span className={`inline-flex items-center gap-1 px-2.5 py-1 rounded-lg text-xs font-bold border ${statusColors[order.status]}`}>
                                                                    <StatusIcon size={12} /> {order.status}
                                                                </span>
                                                            </td>
                                                            <td className="p-4 text-xs text-gray-500">{new Date(order.createdAt).toLocaleDateString()}</td>
                                                        </tr>
                                                    );
                                                })}
                                                {orders.length === 0 && (
                                                    <tr><td colSpan="5" className="p-8 text-center text-gray-400">No orders yet</td></tr>
                                                )}
                                            </tbody>
                                        </table>
                                    </div>
                                </div>
                            </div>
                        )}

                        {/* ───── REVENUE TAB ───── */}
                        {activeTab === 'revenue' && (
                            <div className="space-y-6">
                                <div>
                                    <h1 className="text-3xl font-bold text-dark font-display">Revenue Analytics</h1>
                                    <p className="text-gray-500 mt-1">Track your earnings across all dimensions</p>
                                </div>

                                {/* Revenue KPI Cards */}
                                {analytics && (
                                    <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
                                        <div className="bg-gradient-to-br from-orange-500 to-red-500 p-6 rounded-2xl text-white shadow-lg shadow-orange-200">
                                            <div className="flex items-center gap-2 mb-2 opacity-80">
                                                <IndianRupee size={16} />
                                                <span className="text-xs font-semibold uppercase tracking-wider">Total Revenue</span>
                                            </div>
                                            <p className="text-3xl font-bold font-display">₹{(analytics.totalRevenue || 0).toLocaleString('en-IN')}</p>
                                        </div>
                                        <div className="bg-gradient-to-br from-blue-500 to-blue-600 p-6 rounded-2xl text-white shadow-lg shadow-blue-200">
                                            <div className="flex items-center gap-2 mb-2 opacity-80">
                                                <Calendar size={16} />
                                                <span className="text-xs font-semibold uppercase tracking-wider">Today's Revenue</span>
                                            </div>
                                            <p className="text-3xl font-bold font-display">₹{(analytics.todayRevenue || 0).toLocaleString('en-IN')}</p>
                                        </div>
                                        <div className="bg-gradient-to-br from-purple-500 to-purple-600 p-6 rounded-2xl text-white shadow-lg shadow-purple-200">
                                            <div className="flex items-center gap-2 mb-2 opacity-80">
                                                <ShoppingBag size={16} />
                                                <span className="text-xs font-semibold uppercase tracking-wider">Today's Orders</span>
                                            </div>
                                            <p className="text-3xl font-bold font-display">{analytics.todayOrders || 0}</p>
                                        </div>
                                        <div className="bg-gradient-to-br from-green-500 to-emerald-600 p-6 rounded-2xl text-white shadow-lg shadow-green-200">
                                            <div className="flex items-center gap-2 mb-2 opacity-80">
                                                <TrendingUp size={16} />
                                                <span className="text-xs font-semibold uppercase tracking-wider">Avg Order Value</span>
                                            </div>
                                            <p className="text-3xl font-bold font-display">₹{stats.totalOrders > 0 ? Math.round((analytics.totalRevenue || 0) / stats.totalOrders).toLocaleString('en-IN') : 0}</p>
                                        </div>
                                    </div>
                                )}

                                {/* View Toggle */}
                                <div className="flex gap-2 flex-wrap">
                                    {[
                                        { id: 'daily', label: '📅 Daily (30 Days)', icon: Calendar },
                                        { id: 'monthly', label: '📊 Monthly', icon: BarChart3 },
                                        { id: 'product', label: '📦 Product-wise', icon: Package },
                                    ].map(v => (
                                        <button
                                            key={v.id}
                                            onClick={() => setRevenueView(v.id)}
                                            className={`px-5 py-2.5 rounded-xl text-sm font-semibold border transition-all ${revenueView === v.id
                                                ? 'bg-gradient-to-r from-orange-500 to-red-500 text-white border-transparent shadow-md shadow-orange-200'
                                                : 'bg-white text-gray-600 border-gray-200 hover:border-orange-300'
                                                }`}
                                        >
                                            {v.label}
                                        </button>
                                    ))}
                                </div>

                                {/* Daily Revenue Chart */}
                                {revenueView === 'daily' && analytics?.dailyRevenue && (
                                    <div className="bg-white rounded-2xl border border-gray-100 shadow-card p-6">
                                        <h3 className="font-bold text-dark font-display text-lg mb-1">Daily Revenue — Last 30 Days</h3>
                                        <p className="text-xs text-gray-400 mb-6">Revenue and order count per day (excl. cancelled)</p>
                                        <ResponsiveContainer width="100%" height={380}>
                                            <ComposedChart data={analytics.dailyRevenue}>
                                                <defs>
                                                    <linearGradient id="dailyGrad" x1="0" y1="0" x2="0" y2="1">
                                                        <stop offset="0%" stopColor="#3b82f6" stopOpacity={0.4} />
                                                        <stop offset="100%" stopColor="#3b82f6" stopOpacity={0.02} />
                                                    </linearGradient>
                                                </defs>
                                                <CartesianGrid strokeDasharray="3 3" stroke="#f3f4f6" vertical={false} />
                                                <XAxis dataKey="date" tick={{ fontSize: 9, fill: '#9ca3af' }} axisLine={false} tickLine={false} interval={2} />
                                                <YAxis yAxisId="left" tick={{ fontSize: 11, fill: '#9ca3af' }} tickFormatter={v => `₹${(v / 1000).toFixed(0)}k`} axisLine={false} tickLine={false} />
                                                <YAxis yAxisId="right" orientation="right" tick={{ fontSize: 11, fill: '#a78bfa' }} axisLine={false} tickLine={false} />
                                                <Tooltip formatter={(v, name) => [name === 'revenue' ? `₹${v.toLocaleString('en-IN')}` : v, name === 'revenue' ? 'Revenue' : 'Orders']} contentStyle={{ borderRadius: '16px', fontSize: '12px', border: '1px solid #e5e7eb', boxShadow: '0 10px 25px rgba(0,0,0,0.08)' }} />
                                                <Area yAxisId="left" type="monotone" dataKey="revenue" stroke="#3b82f6" strokeWidth={2.5} fill="url(#dailyGrad)" dot={false} />
                                                <Bar yAxisId="right" dataKey="orders" fill="#a78bfa" barSize={14} radius={[4, 4, 0, 0]} opacity={0.6} />
                                            </ComposedChart>
                                        </ResponsiveContainer>
                                        <div className="mt-8 overflow-x-auto">
                                            <table className="w-full text-left">
                                                <thead className="bg-gray-50 text-xs text-gray-500 uppercase tracking-wider">
                                                    <tr>
                                                        <th className="p-3 font-medium">Date</th>
                                                        <th className="p-3 font-medium text-right">Orders</th>
                                                        <th className="p-3 font-medium text-right">Revenue</th>
                                                    </tr>
                                                </thead>
                                                <tbody className="divide-y divide-gray-100">
                                                    {[...analytics.dailyRevenue].reverse().map((d, i) => (
                                                        <tr key={i} className="hover:bg-gray-50 transition-colors">
                                                            <td className="p-3 text-sm font-semibold text-dark">{d.date}</td>
                                                            <td className="p-3 text-sm text-gray-600 text-right">{d.orders}</td>
                                                            <td className="p-3 text-sm font-bold text-dark text-right">₹{(d.revenue || 0).toLocaleString('en-IN')}</td>
                                                        </tr>
                                                    ))}
                                                </tbody>
                                            </table>
                                        </div>
                                    </div>
                                )}

                                {/* Monthly Revenue Chart */}
                                {revenueView === 'monthly' && analytics?.monthlyRevenue && (
                                    <div className="bg-white rounded-2xl border border-gray-100 shadow-card p-6">
                                        <h3 className="font-bold text-dark font-display text-lg mb-1">Monthly Revenue — Last 6 Months</h3>
                                        <p className="text-xs text-gray-400 mb-6">Revenue trend with order count overlay</p>
                                        <ResponsiveContainer width="100%" height={380}>
                                            <ComposedChart data={analytics.monthlyRevenue}>
                                                <defs>
                                                    <linearGradient id="monthlyGrad" x1="0" y1="0" x2="0" y2="1">
                                                        <stop offset="0%" stopColor="#f97316" stopOpacity={0.5} />
                                                        <stop offset="100%" stopColor="#f97316" stopOpacity={0.02} />
                                                    </linearGradient>
                                                </defs>
                                                <CartesianGrid strokeDasharray="3 3" stroke="#f3f4f6" vertical={false} />
                                                <XAxis dataKey="month" tick={{ fontSize: 12, fill: '#6b7280', fontWeight: 600 }} axisLine={false} tickLine={false} />
                                                <YAxis yAxisId="left" tick={{ fontSize: 11, fill: '#9ca3af' }} tickFormatter={v => `₹${(v / 1000).toFixed(0)}k`} axisLine={false} tickLine={false} />
                                                <YAxis yAxisId="right" orientation="right" tick={{ fontSize: 11, fill: '#10b981' }} axisLine={false} tickLine={false} />
                                                <Tooltip formatter={(v, name) => [name === 'revenue' ? `₹${v.toLocaleString('en-IN')}` : v, name === 'revenue' ? 'Revenue' : 'Orders']} contentStyle={{ borderRadius: '16px', fontSize: '12px', border: '1px solid #e5e7eb', boxShadow: '0 10px 25px rgba(0,0,0,0.08)' }} />
                                                <Area yAxisId="left" type="monotone" dataKey="revenue" stroke="#f97316" strokeWidth={3} fill="url(#monthlyGrad)" dot={{ r: 5, fill: '#f97316', strokeWidth: 3, stroke: '#fff' }} activeDot={{ r: 7 }} />
                                                <Bar yAxisId="right" dataKey="orders" fill="#10b981" barSize={28} radius={[6, 6, 0, 0]} opacity={0.7} />
                                            </ComposedChart>
                                        </ResponsiveContainer>
                                        <div className="mt-8 overflow-x-auto">
                                            <table className="w-full text-left">
                                                <thead className="bg-gray-50 text-xs text-gray-500 uppercase tracking-wider">
                                                    <tr>
                                                        <th className="p-3 font-medium">Month</th>
                                                        <th className="p-3 font-medium text-right">Orders</th>
                                                        <th className="p-3 font-medium text-right">Revenue</th>
                                                    </tr>
                                                </thead>
                                                <tbody className="divide-y divide-gray-100">
                                                    {[...analytics.monthlyRevenue].reverse().map((m, i) => (
                                                        <tr key={i} className="hover:bg-gray-50 transition-colors">
                                                            <td className="p-3 text-sm font-semibold text-dark">{m.month}</td>
                                                            <td className="p-3 text-sm text-gray-600 text-right">{m.orders}</td>
                                                            <td className="p-3 text-sm font-bold text-dark text-right">₹{(m.revenue || 0).toLocaleString('en-IN')}</td>
                                                        </tr>
                                                    ))}
                                                </tbody>
                                            </table>
                                        </div>
                                    </div>
                                )}

                                {/* Product-wise Revenue */}
                                {revenueView === 'product' && analytics?.productRevenue && (
                                    <div className="bg-white rounded-2xl border border-gray-100 shadow-card p-6">
                                        <h3 className="font-bold text-dark font-display text-lg mb-1">Product-wise Revenue</h3>
                                        <p className="text-xs text-gray-400 mb-6">Top 10 products by total revenue</p>
                                        {analytics.productRevenue.length > 0 ? (
                                            <>
                                                <ResponsiveContainer width="100%" height={380}>
                                                    <BarChart data={analytics.productRevenue} layout="vertical" margin={{ left: 20, right: 30 }} barSize={28}>
                                                        <defs>
                                                            <linearGradient id="prodGrad" x1="0" y1="0" x2="1" y2="0">
                                                                <stop offset="0%" stopColor="#6366f1" stopOpacity={1} />
                                                                <stop offset="100%" stopColor="#a855f7" stopOpacity={0.85} />
                                                            </linearGradient>
                                                        </defs>
                                                        <CartesianGrid strokeDasharray="3 3" stroke="#f3f4f6" horizontal={false} />
                                                        <XAxis type="number" tick={{ fontSize: 11, fill: '#9ca3af' }} tickFormatter={v => `₹${(v / 1000).toFixed(0)}k`} axisLine={false} tickLine={false} />
                                                        <YAxis dataKey="name" type="category" tick={{ fontSize: 11, fill: '#374151', fontWeight: 600 }} width={140} axisLine={false} tickLine={false} />
                                                        <Tooltip formatter={(v) => [`₹${v.toLocaleString('en-IN')}`, 'Revenue']} contentStyle={{ borderRadius: '16px', fontSize: '12px', border: '1px solid #e5e7eb', boxShadow: '0 10px 25px rgba(0,0,0,0.08)' }} cursor={{ fill: 'rgba(99,102,241,0.06)' }} />
                                                        <Bar dataKey="totalRevenue" fill="url(#prodGrad)" radius={[0, 8, 8, 0]} />
                                                    </BarChart>
                                                </ResponsiveContainer>
                                                {/* Product revenue table */}
                                                <div className="mt-6 overflow-x-auto">
                                                    <table className="w-full text-left">
                                                        <thead className="bg-gray-50 text-xs text-gray-500 uppercase tracking-wider">
                                                            <tr>
                                                                <th className="p-3 font-medium">#</th>
                                                                <th className="p-3 font-medium">Product</th>
                                                                <th className="p-3 font-medium text-right">Qty Sold</th>
                                                                <th className="p-3 font-medium text-right">Revenue</th>
                                                            </tr>
                                                        </thead>
                                                        <tbody className="divide-y divide-gray-100">
                                                            {analytics.productRevenue.map((p, i) => (
                                                                <tr key={i} className="hover:bg-gray-50 transition-colors">
                                                                    <td className="p-3 text-sm text-gray-400 font-bold">{i + 1}</td>
                                                                    <td className="p-3 text-sm font-semibold text-dark">{p.name}</td>
                                                                    <td className="p-3 text-sm text-gray-600 text-right">{p.totalQty.toLocaleString()} pcs</td>
                                                                    <td className="p-3 text-sm font-bold text-dark text-right">₹{p.totalRevenue.toLocaleString('en-IN')}</td>
                                                                </tr>
                                                            ))}
                                                        </tbody>
                                                    </table>
                                                </div>
                                            </>
                                        ) : (
                                            <div className="text-center py-16 text-gray-400">
                                                <Package size={40} className="mx-auto mb-3 opacity-30" />
                                                <p>No product revenue data yet.</p>
                                            </div>
                                        )}
                                    </div>
                                )}
                            </div>
                        )}

                        {/* ───── ORDERS TAB ───── */}
                        {activeTab === 'orders' && (
                            <div className="space-y-6">
                                <div className="flex justify-between items-center">
                                    <div>
                                        <h1 className="text-3xl font-bold text-dark font-display">Order Management</h1>
                                        <p className="text-gray-500 mt-1">{orders.length} total orders</p>
                                    </div>
                                </div>

                                <div className="bg-white rounded-2xl border border-gray-100 shadow-card overflow-hidden">
                                    <div className="overflow-x-auto">
                                        <table className="w-full text-left">
                                            <thead className="bg-gray-50 text-xs text-gray-500 uppercase tracking-wider">
                                                <tr>
                                                    <th className="p-4 font-medium">Customer</th>
                                                    <th className="p-4 font-medium">Contact</th>
                                                    <th className="p-4 font-medium">Products</th>
                                                    <th className="p-4 font-medium">Total Qty</th>
                                                    <th className="p-4 font-medium">Total Price</th>
                                                    <th className="p-4 font-medium">Details</th>
                                                    <th className="p-4 font-medium w-44">Status</th>
                                                </tr>
                                            </thead>
                                            <tbody className="divide-y divide-gray-100">
                                                {orders.map(order => (
                                                    <tr key={order._id} className="hover:bg-gray-50 transition-colors">
                                                        <td className="p-4">
                                                            <p className="font-semibold text-sm text-dark">{order.contactDetails?.name || order.user?.name}</p>
                                                            <p className="text-xs text-gray-400">{order.contactDetails?.companyName}</p>
                                                        </td>
                                                        <td className="p-4">
                                                            <p className="text-xs text-gray-600">{order.contactDetails?.email}</p>
                                                            <p className="text-xs text-gray-400">{order.contactDetails?.phone}</p>
                                                        </td>
                                                        <td className="p-4 text-sm font-medium text-dark">
                                                            {order.orderItems?.map((item, idx) => (
                                                                <div key={idx} className="mb-1 last:mb-0">
                                                                    {item.quantity}x {item.product?.title || 'Item'}
                                                                </div>
                                                            ))}
                                                        </td>
                                                        <td className="p-4 text-sm font-bold text-dark">
                                                            {order.orderItems?.reduce((sum, item) => sum + item.quantity, 0) || 0}
                                                        </td>
                                                        <td className="p-4 text-sm font-bold text-dark">
                                                            ₹{order.totalPrice?.toLocaleString() || 0}
                                                        </td>
                                                        <td className="p-4 text-xs text-gray-500 max-w-[200px]">
                                                            <p className="truncate">{order.customizationDetails || 'No details'}</p>
                                                            {order.logoUrl && (
                                                                <a href={`http://localhost:5000${order.logoUrl}`} target="_blank" rel="noreferrer" className="text-brand hover:underline mt-1 block">View File</a>
                                                            )}
                                                        </td>
                                                        <td className="p-4">
                                                            <select
                                                                className={`text-xs px-3 py-2 rounded-xl border font-bold focus:ring-2 focus:ring-brand/30 focus:border-brand outline-none cursor-pointer ${statusColors[order.status]}`}
                                                                value={order.status}
                                                                onChange={(e) => updateOrderStatus(order._id, e.target.value)}
                                                            >
                                                                <option value="Ordered">📦 Ordered</option>
                                                                <option value="Under Process">🔄 Under Process</option>
                                                                <option value="Shipped">🚚 Shipped</option>
                                                                <option value="Delivered">✅ Delivered</option>
                                                                <option value="Cancelled">❌ Cancelled</option>
                                                            </select>
                                                        </td>
                                                    </tr>
                                                ))}
                                                {orders.length === 0 && (
                                                    <tr><td colSpan="6" className="p-12 text-center text-gray-400">No orders found</td></tr>
                                                )}
                                            </tbody>
                                        </table>
                                    </div>
                                </div>
                            </div>
                        )}

                        {/* ───── PRODUCTS TAB ───── */}
                        {activeTab === 'products' && (
                            <div className="space-y-6">
                                <div className="flex justify-between items-center">
                                    <div>
                                        <h1 className="text-3xl font-bold text-dark font-display">Products</h1>
                                        <p className="text-gray-500 mt-1">{products.length} products in catalog</p>
                                    </div>
                                    <div className="flex gap-2 flex-wrap justify-end">
                                        <button
                                            onClick={async () => {
                                                try {
                                                    const res = await axios.post(`${API}/admin/migrate-qty`, {}, config);
                                                    alert(res.data.message);
                                                    fetchAll();
                                                } catch (e) {
                                                    alert('Migration failed: ' + (e.response?.data?.message || e.message));
                                                }
                                            }}
                                            className="px-4 py-2 rounded-xl text-sm font-semibold bg-blue-50 text-blue-700 border border-blue-200 hover:bg-blue-100 transition-colors"
                                            title="Sets all old products (0 or null) to 9999 to show them as in-stock"
                                        >
                                            🔧 Fix Old Products Stock
                                        </button>
                                        <button onClick={() => { setEditingProduct(null); setShowProductModal(true); }} className="btn-primary flex items-center gap-2">
                                            <Plus size={18} /> Add Product
                                        </button>
                                    </div>
                                </div>

                                {/* Gender Filter Bar */}
                                <div className="flex flex-wrap gap-2">
                                    {['All', 'Men', 'Women', 'Unisex'].map(g => (
                                        <button
                                            key={g}
                                            onClick={() => setProductGenderFilter(g)}
                                            className={`px-4 py-1.5 rounded-xl text-sm font-semibold border transition-all ${productGenderFilter === g
                                                ? 'bg-gradient-to-r from-orange-500 to-red-500 text-white border-transparent shadow-md'
                                                : 'bg-white text-gray-600 border-gray-200 hover:border-orange-300'
                                                }`}
                                        >
                                            {g === 'All' ? '👕 All' : g === 'Men' ? '👔 Men' : g === 'Women' ? '👗 Women' : '🔀 Unisex'}
                                        </button>
                                    ))}
                                </div>

                                <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
                                    {products
                                        .filter(p => productGenderFilter === 'All' || p.gender === productGenderFilter)
                                        .map(product => {
                                            const isOutOfStock = product.availableQuantity <= 0;
                                            return (
                                                <div key={product._id} className="bg-white rounded-2xl border border-gray-100 shadow-card overflow-hidden group">
                                                    <div className="h-48 bg-gray-100 overflow-hidden relative">
                                                        <img
                                                            src={(product.images?.[0]?.startsWith('http') || product.images?.[0]?.startsWith('/images/')) ? product.images[0] : `http://localhost:5000${product.images?.[0] || ''}`}
                                                            alt={product.title}
                                                            className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                                                            onError={(e) => { e.target.src = 'https://placehold.co/400x300?text=No+Image'; }}
                                                        />
                                                        <div className="absolute top-3 left-3 flex flex-col gap-1">
                                                            {product.isFeatured && (
                                                                <span className="bg-brand text-white text-[10px] font-bold px-2 py-1 rounded-md uppercase">Featured</span>
                                                            )}
                                                            {isOutOfStock ? (
                                                                <span className="bg-red-600 text-white text-[10px] font-bold px-2 py-1 rounded-md uppercase">Out of Stock</span>
                                                            ) : (
                                                                <span className="bg-green-600 text-white text-[10px] font-bold px-2 py-1 rounded-md">{product.availableQuantity} pcs left</span>
                                                            )}
                                                        </div>
                                                        <span className="absolute top-3 right-3 bg-black/60 text-white text-[10px] font-bold px-2 py-1 rounded-md">
                                                            {product.gender || 'Unisex'}
                                                        </span>
                                                    </div>
                                                    <div className="p-5">
                                                        <h3 className="font-bold text-dark font-display text-lg mb-1">{product.title}</h3>
                                                        <p className="text-gray-400 text-xs mb-3">{product.category?.name}</p>
                                                        <p className="text-sm text-gray-500 line-clamp-2 mb-4">{product.description}</p>
                                                        <div className="flex justify-between items-center pt-3 border-t border-gray-100">
                                                            <span className="font-bold text-dark font-display">₹{product.priceRange?.min}<span className="text-xs font-normal text-gray-400"> / pc</span></span>
                                                            <div className="flex gap-2">
                                                                <button onClick={() => { setEditingProduct(product); setShowProductModal(true); }} className="w-8 h-8 bg-blue-50 text-blue-600 rounded-lg flex items-center justify-center hover:bg-blue-100 transition-colors">
                                                                    <Edit3 size={14} />
                                                                </button>
                                                                <button onClick={() => deleteProduct(product._id)} className="w-8 h-8 bg-red-50 text-red-600 rounded-lg flex items-center justify-center hover:bg-red-100 transition-colors">
                                                                    <Trash2 size={14} />
                                                                </button>
                                                            </div>
                                                        </div>
                                                    </div>
                                                </div>
                                            );
                                        })}
                                    {products.filter(p => productGenderFilter === 'All' || p.gender === productGenderFilter).length === 0 && (
                                        <div className="col-span-3 text-center py-16 text-gray-400">
                                            <Package size={40} className="mx-auto mb-3 opacity-30" />
                                            <p>No products found for this filter.</p>
                                        </div>
                                    )}
                                </div>
                            </div>
                        )}

                        {/* ───── CATEGORIES TAB ───── */}
                        {activeTab === 'categories' && (
                            <div className="space-y-6">
                                <div className="flex justify-between items-center">
                                    <div>
                                        <h1 className="text-3xl font-bold text-dark font-display">Categories</h1>
                                        <p className="text-gray-500 mt-1">{categories.length} categories</p>
                                    </div>
                                    <button onClick={() => { setEditingCategory(null); setShowCategoryModal(true); }} className="btn-primary flex items-center gap-2">
                                        <Plus size={18} /> Add Category
                                    </button>
                                </div>

                                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                                    {categories.map(cat => (
                                        <div key={cat._id} className="bg-white p-6 rounded-2xl border border-gray-100 shadow-card flex items-center justify-between gap-4">
                                            <div className="flex items-center gap-4">
                                                <div className="w-12 h-12 bg-orange-50 text-brand rounded-xl flex items-center justify-center font-bold text-lg">
                                                    {cat.name.charAt(0)}
                                                </div>
                                                <div>
                                                    <h3 className="font-bold text-dark">{cat.name}</h3>
                                                    <p className="text-xs text-gray-400">{cat.description || 'No description'}</p>
                                                </div>
                                            </div>
                                            <div className="flex gap-2 flex-shrink-0">
                                                <button onClick={() => { setEditingCategory(cat); setShowCategoryModal(true); }} className="w-8 h-8 bg-blue-50 text-blue-600 rounded-lg flex items-center justify-center hover:bg-blue-100">
                                                    <Edit3 size={14} />
                                                </button>
                                                <button onClick={() => deleteCategory(cat._id)} className="w-8 h-8 bg-red-50 text-red-600 rounded-lg flex items-center justify-center hover:bg-red-100">
                                                    <Trash2 size={14} />
                                                </button>
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            </div>
                        )}

                        {/* ───── USERS TAB ───── */}
                        {activeTab === 'users' && (
                            <div className="space-y-6">
                                <div>
                                    <h1 className="text-3xl font-bold text-dark font-display">User Management</h1>
                                    <p className="text-gray-500 mt-1">{users.length} registered users</p>
                                </div>

                                <div className="bg-white rounded-2xl border border-gray-100 shadow-card overflow-hidden">
                                    <div className="overflow-x-auto">
                                        <table className="w-full text-left">
                                            <thead className="bg-gray-50 text-xs text-gray-500 uppercase tracking-wider">
                                                <tr>
                                                    <th className="p-4 font-medium">User</th>
                                                    <th className="p-4 font-medium">Company</th>
                                                    <th className="p-4 font-medium">Phone</th>
                                                    <th className="p-4 font-medium">Role</th>
                                                    <th className="p-4 font-medium">Joined</th>
                                                    <th className="p-4 font-medium">Actions</th>
                                                </tr>
                                            </thead>
                                            <tbody className="divide-y divide-gray-100">
                                                {users.map(u => (
                                                    <tr key={u._id} className="hover:bg-gray-50 transition-colors">
                                                        <td className="p-4">
                                                            <div className="flex items-center gap-3">
                                                                <div className="w-9 h-9 bg-gradient-to-br from-orange-400 to-red-500 rounded-lg flex items-center justify-center text-white font-bold text-xs">
                                                                    {u.name.charAt(0).toUpperCase()}
                                                                </div>
                                                                <div>
                                                                    <p className="font-semibold text-sm text-dark">{u.name}</p>
                                                                    <p className="text-xs text-gray-400">{u.email}</p>
                                                                </div>
                                                            </div>
                                                        </td>
                                                        <td className="p-4 text-sm text-gray-600">{u.companyName || '—'}</td>
                                                        <td className="p-4 text-sm text-gray-600">{u.phone || '—'}</td>
                                                        <td className="p-4">
                                                            <span className={`px-2.5 py-1 rounded-lg text-xs font-bold ${u.role === 'admin' ? 'bg-purple-50 text-purple-700 border border-purple-200' : 'bg-gray-50 text-gray-600 border border-gray-200'
                                                                }`}>
                                                                {u.role.toUpperCase()}
                                                            </span>
                                                        </td>
                                                        <td className="p-4 text-xs text-gray-500">{new Date(u.createdAt).toLocaleDateString()}</td>
                                                        <td className="p-4">
                                                            {u.role !== 'admin' ? (
                                                                <button onClick={() => deleteUser(u._id)} className="w-8 h-8 bg-red-50 text-red-600 rounded-lg flex items-center justify-center hover:bg-red-100 transition-colors">
                                                                    <Trash2 size={14} />
                                                                </button>
                                                            ) : (
                                                                <span className="text-xs text-gray-400 italic">Protected</span>
                                                            )}
                                                        </td>
                                                    </tr>
                                                ))}
                                            </tbody>
                                        </table>
                                    </div>
                                </div>
                            </div>
                        )}

                        {/* ───── ADS TAB ───── */}
                        {activeTab === 'ads' && (
                            <div className="space-y-6">
                                <div className="flex justify-between items-center">
                                    <div>
                                        <h1 className="text-3xl font-bold text-dark font-display">Ads & Offers</h1>
                                        <p className="text-gray-500 mt-1">{ads.length} banner{ads.length !== 1 ? 's' : ''} — shown on the home page carousel</p>
                                    </div>
                                    <button onClick={() => { setEditingAd(null); setShowAdModal(true); }} className="btn-primary flex items-center gap-2">
                                        <Plus size={18} /> Add Banner
                                    </button>
                                </div>

                                {ads.length === 0 ? (
                                    <div className="bg-white rounded-2xl border border-gray-100 shadow-card p-16 text-center">
                                        <Megaphone size={40} className="text-gray-300 mx-auto mb-4" />
                                        <h3 className="font-bold text-gray-700 mb-1">No ads yet</h3>
                                        <p className="text-sm text-gray-400">Add your first promotional banner to display on the home page.</p>
                                    </div>
                                ) : (
                                    <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                                        {ads.map(ad => (
                                            <div key={ad._id} className="bg-white rounded-2xl border border-gray-100 shadow-card overflow-hidden">
                                                {/* Preview strip */}
                                                <div className="h-24 px-6 flex flex-col justify-center relative overflow-hidden"
                                                    style={{ background: `linear-gradient(135deg, ${ad.bgColor} 0%, ${ad.bgColor}ee 60%, ${ad.accentColor}30 100%)` }}>
                                                    <div style={{ position: 'absolute', right: 0, top: 0, width: '120px', height: '120px', borderRadius: '50%', opacity: 0.15, background: `radial-gradient(circle, ${ad.accentColor}, transparent)`, transform: 'translate(30%,-30%)' }} />
                                                    {ad.badge && <span style={{ fontSize: '10px', fontWeight: 700, color: ad.accentColor, marginBottom: '4px' }}>{ad.badge}</span>}
                                                    <p style={{ color: '#fff', fontWeight: 700, fontSize: '14px', lineHeight: 1.3 }} className="truncate">{ad.title}</p>
                                                </div>
                                                {/* Card body */}
                                                <div className="p-4">
                                                    <p className="text-xs text-gray-500 line-clamp-2 mb-3">{ad.subtitle || 'No subtitle'}</p>
                                                    <div className="flex items-center justify-between">
                                                        <div className="flex items-center gap-2">
                                                            <button onClick={() => toggleAdActive(ad)}
                                                                className={`inline-flex items-center gap-1.5 text-xs font-semibold px-3 py-1.5 rounded-xl border transition-all ${ad.isActive ? 'bg-green-50 text-green-700 border-green-200' : 'bg-gray-50 text-gray-500 border-gray-200'}`}>
                                                                {ad.isActive ? <Eye size={12} /> : <EyeOff size={12} />}
                                                                {ad.isActive ? 'Active' : 'Hidden'}
                                                            </button>
                                                            <span style={{ background: `${ad.accentColor}22`, color: ad.accentColor, border: `1px solid ${ad.accentColor}40` }}
                                                                className="text-xs font-bold px-2 py-1 rounded-lg">
                                                                {ad.ctaText || 'CTA'}
                                                            </span>
                                                        </div>
                                                        <div className="flex gap-2">
                                                            <button onClick={() => { setEditingAd(ad); setShowAdModal(true); }}
                                                                className="w-8 h-8 bg-blue-50 text-blue-600 rounded-lg flex items-center justify-center hover:bg-blue-100">
                                                                <Edit3 size={14} />
                                                            </button>
                                                            <button onClick={() => deleteAd(ad._id)}
                                                                className="w-8 h-8 bg-red-50 text-red-600 rounded-lg flex items-center justify-center hover:bg-red-100">
                                                                <Trash2 size={14} />
                                                            </button>
                                                        </div>
                                                    </div>
                                                </div>
                                            </div>
                                        ))}
                                    </div>
                                )}
                            </div>
                        )}

                    </div>
                </div>
            </div>

            {/* ═══════════════ PRODUCT MODAL ═══════════════ */}
            {showProductModal && (
                <ProductModal
                    product={editingProduct}
                    categories={categories}
                    config={config}
                    onClose={() => setShowProductModal(false)}
                    onSave={() => { setShowProductModal(false); fetchAll(); }}
                />
            )}

            {/* ═══════════════ CATEGORY MODAL ═══════════════ */}
            {showCategoryModal && (
                <CategoryModal
                    category={editingCategory}
                    config={config}
                    onClose={() => setShowCategoryModal(false)}
                    onSave={() => { setShowCategoryModal(false); fetchAll(); }}
                />)}

            {showAdModal && (
                <AdModal
                    ad={editingAd}
                    config={config}
                    onClose={() => setShowAdModal(false)}
                    onSave={() => { setShowAdModal(false); fetchAll(); }}
                />
            )}
        </div>
    );
};

// ═══════════════ PRODUCT ADD/EDIT MODAL ═══════════════
const ProductModal = ({ product, categories, config, onClose, onSave }) => {
    const [formData, setFormData] = useState({
        title: product?.title || '',
        description: product?.description || '',
        category: product?.category?._id || product?.category || '',
        priceMin: product?.priceRange?.min || '',
        priceMax: product?.priceRange?.max || '',
        fabricType: product?.fabricType || '',
        gender: product?.gender || 'Unisex',
        availableQuantity: product?.availableQuantity ?? 9999,
        colors: product?.colors?.join(', ') || '',
        sizes: product?.sizes?.join(', ') || 'S, M, L, XL, XXL',
        isFeatured: product?.isFeatured || false,
        imageUrl: product?.images?.[0] || ''
    });
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState('');
    const [uploading, setUploading] = useState(false);
    const [uploadPreview, setUploadPreview] = useState(product?.images?.[0] || '');

    const handleImageUpload = async (files) => {
        if (!files || files.length === 0) return;
        setUploading(true);
        try {
            const fd = new FormData();
            Array.from(files).forEach(f => fd.append('images', f));
            const { data } = await axios.post(`${API}/admin/upload`, fd, {
                headers: { ...config.headers, 'Content-Type': 'multipart/form-data' }
            });
            const url = data.urls[0];
            setFormData(prev => ({ ...prev, imageUrl: url }));
            setUploadPreview(url);
        } catch (err) {
            setError('Image upload failed: ' + (err.response?.data?.message || err.message));
        } finally {
            setUploading(false);
        }
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setLoading(true);
        setError('');

        try {
            const payload = {
                title: formData.title,
                description: formData.description,
                category: formData.category,
                priceRange: { min: Number(formData.priceMin), max: Number(formData.priceMax) },
                fabricType: formData.fabricType,
                gender: formData.gender,
                availableQuantity: Number(formData.availableQuantity),
                colors: formData.colors.split(',').map(c => c.trim()).filter(c => c),
                sizes: formData.sizes.split(',').map(s => s.trim()).filter(s => s),
                isFeatured: formData.isFeatured,
                images: formData.imageUrl ? [formData.imageUrl] : []
            };

            if (product) {
                await axios.put(`${API}/products/${product._id}`, payload, {
                    ...config,
                    headers: { ...config.headers, 'Content-Type': 'application/json' }
                });
            } else {
                await axios.post(`${API}/products`, payload, {
                    ...config,
                    headers: { ...config.headers, 'Content-Type': 'application/json' }
                });
            }
            onSave();
        } catch (err) {
            setError(err.response?.data?.message || err.message);
            setLoading(false);
        }
    };

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
            <div className="absolute inset-0 bg-black/50 backdrop-blur-sm" onClick={onClose}></div>
            <div className="bg-white rounded-3xl shadow-2xl border border-gray-100 w-full max-w-2xl max-h-[90vh] overflow-auto relative z-10 animate-fade-in-up">
                <div className="p-6 border-b border-gray-100 flex justify-between items-center sticky top-0 bg-white rounded-t-3xl z-10">
                    <h2 className="font-display font-bold text-xl text-dark">{product ? 'Edit Product' : 'Add New Product'}</h2>
                    <button onClick={onClose} className="w-8 h-8 bg-gray-100 rounded-lg flex items-center justify-center hover:bg-gray-200"><X size={16} /></button>
                </div>

                <form onSubmit={handleSubmit} className="p-6 space-y-5">
                    {error && <div className="bg-red-50 text-red-600 p-3 rounded-xl text-sm border border-red-100">{error}</div>}

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                        <div className="md:col-span-2">
                            <label className="block text-sm font-semibold text-dark mb-2">Product Title *</label>
                            <input type="text" required value={formData.title} onChange={(e) => setFormData({ ...formData, title: e.target.value })} className="input-field" placeholder="Premium Round Neck T-Shirt" />
                        </div>
                        <div className="md:col-span-2">
                            <label className="block text-sm font-semibold text-dark mb-2">Description *</label>
                            <textarea rows="3" required value={formData.description} onChange={(e) => setFormData({ ...formData, description: e.target.value })} className="input-field resize-none" placeholder="Detailed product description..." />
                        </div>
                        <div>
                            <label className="block text-sm font-semibold text-dark mb-2">Category *</label>
                            <select required value={formData.category} onChange={(e) => setFormData({ ...formData, category: e.target.value })} className="input-field bg-white">
                                <option value="">Select Category</option>
                                {categories.map(c => <option key={c._id} value={c._id}>{c.name}</option>)}
                            </select>
                        </div>
                        <div>
                            <label className="block text-sm font-semibold text-dark mb-2">Fabric Type *</label>
                            <input type="text" required value={formData.fabricType} onChange={(e) => setFormData({ ...formData, fabricType: e.target.value })} className="input-field" placeholder="100% Cotton - 180 GSM" />
                        </div>
                        <div>
                            <label className="block text-sm font-semibold text-dark mb-2">Price (₹) *</label>
                            <input type="number" required value={formData.priceMin} onChange={(e) => setFormData({ ...formData, priceMin: e.target.value })} className="input-field" placeholder="120" />
                        </div>
                        <div className="md:col-span-2">
                            <label className="block text-sm font-semibold text-dark mb-2">Product Image</label>
                            <div
                                className={`relative border-2 border-dashed rounded-2xl transition-colors ${uploadPreview ? 'border-green-300 bg-green-50' : 'border-gray-200 bg-gray-50 hover:border-orange-300'
                                    }`}
                                onDragOver={(e) => e.preventDefault()}
                                onDrop={(e) => { e.preventDefault(); handleImageUpload(e.dataTransfer.files); }}
                            >
                                {uploadPreview ? (
                                    <div className="flex items-center gap-4 p-4">
                                        <img src={uploadPreview} alt="preview" className="w-20 h-20 rounded-xl object-cover border border-gray-200" />
                                        <div className="flex-1">
                                            <p className="text-sm font-semibold text-green-700">Image ready</p>
                                            <p className="text-xs text-gray-400 truncate">{formData.imageUrl}</p>
                                        </div>
                                        <button type="button" onClick={() => { setUploadPreview(''); setFormData(p => ({ ...p, imageUrl: '' })); }}
                                            className="p-1.5 rounded-lg bg-red-50 text-red-500 hover:bg-red-100">
                                            <X size={14} />
                                        </button>
                                    </div>
                                ) : (
                                    <label className="flex flex-col items-center justify-center py-8 cursor-pointer">
                                        {uploading ? (
                                            <><div className="w-8 h-8 border-2 border-orange-500 border-t-transparent rounded-full animate-spin mb-2" /><p className="text-sm text-gray-500">Uploading to Cloudinary…</p></>
                                        ) : (
                                            <><ImagePlus size={32} className="text-gray-300 mb-2" />
                                                <p className="text-sm font-semibold text-gray-500">Click or drag image here</p>
                                                <p className="text-xs text-gray-400 mt-1">JPG, PNG, WebP • max 5MB</p></>
                                        )}
                                        <input type="file" accept="image/*" className="hidden" disabled={uploading}
                                            onChange={(e) => handleImageUpload(e.target.files)} />
                                    </label>
                                )}
                            </div>
                        </div>
                        <div>
                            <label className="block text-sm font-semibold text-dark mb-2">Gender *</label>
                            <select value={formData.gender} onChange={(e) => setFormData({ ...formData, gender: e.target.value })} className="input-field bg-white">
                                <option value="Men">👔 Men</option>
                                <option value="Women">👗 Women</option>
                                <option value="Unisex">🔀 Unisex</option>
                            </select>
                        </div>
                        <div>
                            <label className="block text-sm font-semibold text-dark mb-2">Available Quantity (pcs) *</label>
                            <input type="number" min="0" required value={formData.availableQuantity} onChange={(e) => setFormData({ ...formData, availableQuantity: e.target.value })} className="input-field" placeholder="e.g. 9999" />
                        </div>
                        <div>
                            <label className="block text-sm font-semibold text-dark mb-2">Colors (comma separated)</label>
                            <input type="text" value={formData.colors} onChange={(e) => setFormData({ ...formData, colors: e.target.value })} className="input-field" placeholder="White, Black, Navy" />
                        </div>
                        <div>
                            <label className="block text-sm font-semibold text-dark mb-2">Sizes (comma separated)</label>
                            <input type="text" value={formData.sizes} onChange={(e) => setFormData({ ...formData, sizes: e.target.value })} className="input-field" placeholder="S, M, L, XL, XXL" />
                        </div>
                        <div className="md:col-span-2">
                            <label className="flex items-center gap-3 cursor-pointer">
                                <input type="checkbox" checked={formData.isFeatured} onChange={(e) => setFormData({ ...formData, isFeatured: e.target.checked })} className="w-5 h-5 accent-brand rounded" />
                                <span className="text-sm font-medium text-dark">Mark as Featured Product</span>
                            </label>
                        </div>
                    </div>

                    <div className="flex justify-end gap-3 pt-4 border-t border-gray-100">
                        <button type="button" onClick={onClose} className="px-6 py-2.5 rounded-xl border border-gray-200 font-medium text-gray-600 hover:bg-gray-50">Cancel</button>
                        <button type="submit" disabled={loading} className="btn-primary flex items-center gap-2">
                            {loading ? <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div> : <Check size={16} />}
                            {product ? 'Update Product' : 'Create Product'}
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
};

// ═══════════════ CATEGORY ADD/EDIT MODAL ═══════════════
const CategoryModal = ({ category, config, onClose, onSave }) => {
    const [name, setName] = useState(category?.name || '');
    const [description, setDescription] = useState(category?.description || '');
    const [loading, setLoading] = useState(false);

    const handleSubmit = async (e) => {
        e.preventDefault();
        setLoading(true);
        try {
            if (category) {
                await axios.put(`${API}/admin/categories/${category._id}`, { name, description }, config);
            } else {
                await axios.post(`${API}/admin/categories`, { name, description }, config);
            }
            onSave();
        } catch (err) {
            alert(err.response?.data?.message || err.message);
            setLoading(false);
        }
    };

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
            <div className="absolute inset-0 bg-black/50 backdrop-blur-sm" onClick={onClose}></div>
            <div className="bg-white rounded-3xl shadow-2xl border border-gray-100 w-full max-w-md relative z-10 animate-fade-in-up">
                <div className="p-6 border-b border-gray-100 flex justify-between items-center">
                    <h2 className="font-display font-bold text-xl text-dark">{category ? 'Edit Category' : 'Add Category'}</h2>
                    <button onClick={onClose} className="w-8 h-8 bg-gray-100 rounded-lg flex items-center justify-center hover:bg-gray-200"><X size={16} /></button>
                </div>
                <form onSubmit={handleSubmit} className="p-6 space-y-5">
                    <div>
                        <label className="block text-sm font-semibold text-dark mb-2">Category Name *</label>
                        <input type="text" required value={name} onChange={(e) => setName(e.target.value)} className="input-field" placeholder="e.g. Sportswear" />
                    </div>
                    <div>
                        <label className="block text-sm font-semibold text-dark mb-2">Description</label>
                        <textarea rows="2" value={description} onChange={(e) => setDescription(e.target.value)} className="input-field resize-none" placeholder="Brief description..." />
                    </div>
                    <div className="flex justify-end gap-3 pt-4 border-t border-gray-100">
                        <button type="button" onClick={onClose} className="px-6 py-2.5 rounded-xl border border-gray-200 font-medium text-gray-600 hover:bg-gray-50">Cancel</button>
                        <button type="submit" disabled={loading} className="btn-primary flex items-center gap-2">
                            {loading ? <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div> : <Check size={16} />}
                            {category ? 'Update' : 'Create'}
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
};

// ═══════════════ AD ADD/EDIT MODAL ═══════════════
const AdModal = ({ ad, config, onClose, onSave }) => {
    const [form, setForm] = useState({
        title: ad?.title || '',
        subtitle: ad?.subtitle || '',
        badge: ad?.badge || '',
        bgColor: ad?.bgColor || '#1a1a1a',
        accentColor: ad?.accentColor || '#ff6b00',
        ctaText: ad?.ctaText || 'Shop Now',
        ctaLink: ad?.ctaLink || '/products',
        isActive: ad?.isActive !== false,
        order: ad?.order ?? 0,
    });
    const [loading, setLoading] = useState(false);

    const handleSubmit = async (e) => {
        e.preventDefault();
        setLoading(true);
        try {
            if (ad) {
                await axios.put(`${API}/admin/ads/${ad._id}`, form, config);
            } else {
                await axios.post(`${API}/admin/ads`, form, config);
            }
            onSave();
        } catch (err) {
            alert(err.response?.data?.message || err.message);
            setLoading(false);
        }
    };

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
            <div className="absolute inset-0 bg-black/50 backdrop-blur-sm" onClick={onClose}></div>
            <div className="bg-white rounded-3xl shadow-2xl border border-gray-100 w-full max-w-2xl max-h-[90vh] overflow-auto relative z-10 animate-fade-in-up">
                <div className="p-6 border-b border-gray-100 flex justify-between items-center sticky top-0 bg-white rounded-t-3xl z-10">
                    <h2 className="font-display font-bold text-xl text-dark">{ad ? 'Edit Banner' : 'New Promotional Banner'}</h2>
                    <button onClick={onClose} className="w-8 h-8 bg-gray-100 rounded-lg flex items-center justify-center hover:bg-gray-200"><X size={16} /></button>
                </div>

                {/* Live preview */}
                <div className="px-6 pt-5">
                    <p className="text-xs font-bold text-gray-400 uppercase tracking-widest mb-2">Live Preview</p>
                    <div className="rounded-2xl overflow-hidden h-28 px-6 flex flex-col justify-center relative"
                        style={{ background: `linear-gradient(135deg, ${form.bgColor} 0%, ${form.bgColor}ee 60%, ${form.accentColor}30 100%)` }}>
                        <div style={{ position: 'absolute', right: 0, top: 0, width: '140px', height: '140px', borderRadius: '50%', opacity: 0.15, background: `radial-gradient(circle, ${form.accentColor}, transparent)`, transform: 'translate(30%,-30%)' }} />
                        {form.badge && <span style={{ fontSize: '10px', fontWeight: 700, color: form.accentColor, marginBottom: '4px' }}>{form.badge}</span>}
                        <p style={{ color: '#fff', fontWeight: 800, fontSize: '16px', lineHeight: 1.3 }}>{form.title || 'Your banner title here'}</p>
                        {form.subtitle && <p style={{ color: 'rgba(255,255,255,0.65)', fontSize: '12px', marginTop: '4px' }} className="line-clamp-1">{form.subtitle}</p>}
                    </div>
                </div>

                <form onSubmit={handleSubmit} className="p-6 space-y-4">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div className="md:col-span-2">
                            <label className="block text-sm font-semibold text-dark mb-2">Banner Title *</label>
                            <input type="text" required value={form.title} onChange={e => setForm({ ...form, title: e.target.value })} className="input-field" placeholder="e.g. Summer Sale — 30% Off" />
                        </div>
                        <div className="md:col-span-2">
                            <label className="block text-sm font-semibold text-dark mb-2">Subtitle</label>
                            <input type="text" value={form.subtitle} onChange={e => setForm({ ...form, subtitle: e.target.value })} className="input-field" placeholder="Short description shown below the title" />
                        </div>
                        <div>
                            <label className="block text-sm font-semibold text-dark mb-2">Badge Label</label>
                            <input type="text" value={form.badge} onChange={e => setForm({ ...form, badge: e.target.value })} className="input-field" placeholder="🔥 HOT DEAL" />
                        </div>
                        <div>
                            <label className="block text-sm font-semibold text-dark mb-2">Sort Order</label>
                            <input type="number" value={form.order} onChange={e => setForm({ ...form, order: Number(e.target.value) })} className="input-field" placeholder="0" />
                        </div>
                        <div>
                            <label className="block text-sm font-semibold text-dark mb-2">Background Color</label>
                            <div className="flex items-center gap-3">
                                <input type="color" value={form.bgColor} onChange={e => setForm({ ...form, bgColor: e.target.value })} className="w-12 h-10 rounded-lg border border-gray-200 cursor-pointer p-1" />
                                <input type="text" value={form.bgColor} onChange={e => setForm({ ...form, bgColor: e.target.value })} className="input-field flex-1" />
                            </div>
                        </div>
                        <div>
                            <label className="block text-sm font-semibold text-dark mb-2">Accent Color</label>
                            <div className="flex items-center gap-3">
                                <input type="color" value={form.accentColor} onChange={e => setForm({ ...form, accentColor: e.target.value })} className="w-12 h-10 rounded-lg border border-gray-200 cursor-pointer p-1" />
                                <input type="text" value={form.accentColor} onChange={e => setForm({ ...form, accentColor: e.target.value })} className="input-field flex-1" />
                            </div>
                        </div>
                        <div>
                            <label className="block text-sm font-semibold text-dark mb-2">CTA Button Text</label>
                            <input type="text" value={form.ctaText} onChange={e => setForm({ ...form, ctaText: e.target.value })} className="input-field" placeholder="Shop Now" />
                        </div>
                        <div>
                            <label className="block text-sm font-semibold text-dark mb-2">CTA Link</label>
                            <input type="text" value={form.ctaLink} onChange={e => setForm({ ...form, ctaLink: e.target.value })} className="input-field" placeholder="/products" />
                        </div>
                        <div className="md:col-span-2">
                            <label className="flex items-center gap-3 cursor-pointer">
                                <input type="checkbox" checked={form.isActive} onChange={e => setForm({ ...form, isActive: e.target.checked })} className="w-5 h-5 accent-brand rounded" />
                                <span className="text-sm font-medium text-dark">Show on homepage carousel (Active)</span>
                            </label>
                        </div>
                    </div>
                    <div className="flex justify-end gap-3 pt-4 border-t border-gray-100">
                        <button type="button" onClick={onClose} className="px-6 py-2.5 rounded-xl border border-gray-200 font-medium text-gray-600 hover:bg-gray-50">Cancel</button>
                        <button type="submit" disabled={loading} className="btn-primary flex items-center gap-2">
                            {loading ? <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div> : <Check size={16} />}
                            {ad ? 'Update Banner' : 'Create Banner'}
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
};

export default AdminDashboard;
