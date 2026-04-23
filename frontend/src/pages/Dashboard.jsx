import { useState, useEffect, useContext } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import { AuthContext } from '../context/AuthContext';
import { CartContext } from '../context/CartContext';
import {
    Package, Clock, CheckCircle, XCircle, X, Truck,
    MapPin, Download, ShoppingBag, TrendingUp, IndianRupee, FileText, RefreshCw, History
} from 'lucide-react';
import jsPDF from 'jspdf';
import autoTable from 'jspdf-autotable';

const Dashboard = () => {
    const { user } = useContext(AuthContext);
    const { addToCart, clearCart } = useContext(CartContext);
    const navigate = useNavigate();
    const [orders, setOrders] = useState([]);
    const [loading, setLoading] = useState(true);
    const [selectedOrder, setSelectedOrder] = useState(null);
    const [downloadingId, setDownloadingId] = useState(null);
    const [reorderingId, setReorderingId] = useState(null);

    useEffect(() => {
        const fetchMyOrders = async () => {
            try {
                const config = { headers: { Authorization: `Bearer ${user.token}` } };
                const { data } = await axios.get('http://localhost:5000/api/orders/myorders', config);
                setOrders(data);
            } catch (error) {
                console.error('Failed to fetch orders');
            } finally {
                setLoading(false);
            }
        };
        if (user) fetchMyOrders();
    }, [user]);

    /* ─── Stats ─────────────────────────────────────────── */
    const totalSpent = orders.reduce((s, o) => s + (o.totalPrice || 0), 0);
    const totalItems = orders.reduce((s, o) => s + (o.orderItems?.reduce((q, i) => q + i.quantity, 0) || 0), 0);
    const activeOrders = orders.filter(o => !['Delivered', 'Cancelled'].includes(o.status)).length;

    /* ─── 1-click Reorder ───────────────────── */
    const handleReorder = async (order, e) => {
        e?.stopPropagation();
        setReorderingId(order._id);
        try {
            clearCart();
            order.orderItems?.forEach(item => {
                if (item.product) {
                    addToCart({ ...item.product, priceRange: { min: item.price } }, item.quantity);
                }
            });
            navigate('/bulk-order');
        } finally {
            setReorderingId(null);
        }
    };

    /* ─── Status badge ───────────────────────────────────── */
    const getStatusBadge = (status) => {
        const map = {
            Ordered: { color: 'text-orange-600 bg-orange-50 border-orange-200', icon: <Clock size={12} />, label: 'Ordered' },
            'Under Process': { color: 'text-blue-600 bg-blue-50 border-blue-200', icon: <Package size={12} />, label: 'Under Process' },
            Shipped: { color: 'text-purple-600 bg-purple-50 border-purple-200', icon: <Truck size={12} />, label: 'Shipped' },
            Delivered: { color: 'text-emerald-600 bg-emerald-50 border-emerald-200', icon: <CheckCircle size={12} />, label: 'Delivered' },
            Cancelled: { color: 'text-red-600 bg-red-50 border-red-200', icon: <XCircle size={12} />, label: 'Cancelled' },
            Pending: { color: 'text-orange-600 bg-orange-50 border-orange-200', icon: <Clock size={12} />, label: 'Ordered' },
            Processing: { color: 'text-blue-600 bg-blue-50 border-blue-200', icon: <Package size={12} />, label: 'Under Process' },
            Completed: { color: 'text-emerald-600 bg-emerald-50 border-emerald-200', icon: <CheckCircle size={12} />, label: 'Delivered' },
        };
        const s = map[status] || { color: 'text-gray-600 bg-gray-50 border-gray-200', icon: <Clock size={12} />, label: status || 'Ordered' };
        return (
            <span className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-semibold border ${s.color}`}>
                {s.icon} {s.label}
            </span>
        );
    };

    /* ─── Timeline progress ──────────────────────────────── */
    const getTimelineProgress = (status) => {
        const idx = ['Ordered', 'Under Process', 'Shipped', 'Delivered'].indexOf(status);
        return idx === -1 ? 0 : (idx / 3) * 100;
    };

    /* ─── Invoice PDF generator ──────────────────────────── */
    const downloadInvoice = (order, e) => {
        e?.stopPropagation();
        setDownloadingId(order._id);

        const doc = new jsPDF();
        const pageW = doc.internal.pageSize.getWidth();

        // ── Header band ──────────────────────────────────────
        doc.setFillColor(30, 30, 30);
        doc.rect(0, 0, pageW, 38, 'F');

        doc.setTextColor(255, 255, 255);
        doc.setFontSize(22);
        doc.setFont('helvetica', 'bold');
        doc.text('GJ TEX', 14, 18);

        doc.setFontSize(8);
        doc.setFont('helvetica', 'normal');
        doc.setTextColor(180, 180, 180);
        doc.text('Premium Wholesale Garments', 14, 25);
        doc.text('Tiruppur, Tamil Nadu, India', 14, 30);

        doc.setFontSize(18);
        doc.setFont('helvetica', 'bold');
        doc.setTextColor(255, 140, 50);
        doc.text('INVOICE', pageW - 14, 20, { align: 'right' });
        doc.setFontSize(8);
        doc.setFont('helvetica', 'normal');
        doc.setTextColor(180, 180, 180);
        doc.text(`#${order._id?.substring(0, 12)?.toUpperCase()}`, pageW - 14, 29, { align: 'right' });
        doc.text(`Date: ${new Date(order.createdAt).toLocaleDateString('en-IN')}`, pageW - 14, 35, { align: 'right' });

        // ── Bill To / Ship To ────────────────────────────────
        const startY = 50;
        doc.setFontSize(8);
        doc.setFont('helvetica', 'bold');
        doc.setTextColor(120, 120, 120);
        doc.text('BILL TO', 14, startY);
        doc.text('SHIP TO', pageW / 2, startY);

        doc.setFontSize(10);
        doc.setTextColor(30, 30, 30);
        doc.setFont('helvetica', 'bold');
        doc.text(order.contactDetails?.name || user.name, 14, startY + 7);
        doc.setFont('helvetica', 'normal');
        doc.setFontSize(9);
        doc.text(order.contactDetails?.companyName || '', 14, startY + 13);
        doc.text(order.contactDetails?.email || user.email, 14, startY + 19);
        doc.text(order.contactDetails?.phone || '', 14, startY + 25);

        doc.setFont('helvetica', 'bold');
        doc.setFontSize(10);
        doc.text(order.contactDetails?.name || user.name, pageW / 2, startY + 7);
        doc.setFont('helvetica', 'normal');
        doc.setFontSize(9);
        const address = order.customizationDetails?.replace('Delivery Address: ', '') || 'N/A';
        const addrLines = doc.splitTextToSize(address, 80);
        doc.text(addrLines, pageW / 2, startY + 13);

        // ── Divider ──────────────────────────────────────────
        doc.setDrawColor(230, 230, 230);
        doc.setLineWidth(0.5);
        doc.line(14, startY + 34, pageW - 14, startY + 34);

        // ── Items table ──────────────────────────────────────
        const items = order.orderItems?.length > 0
            ? order.orderItems.map((item, i) => [
                i + 1,
                item.product?.title || 'Unknown Product',
                item.quantity,
                `Rs. ${item.price?.toLocaleString('en-IN') || 0}`,
                `Rs. ${((item.price || 0) * item.quantity).toLocaleString('en-IN')}`,
            ])
            : [['1', 'Legacy order — details unavailable', '-', '-', '-']];

        autoTable(doc, {
            startY: startY + 40,
            head: [['#', 'Product', 'Qty (pcs)', 'Unit Price', 'Amount']],
            body: items,
            styles: { fontSize: 9, cellPadding: 4, textColor: [30, 30, 30] },
            headStyles: { fillColor: [30, 30, 30], textColor: [255, 255, 255], fontStyle: 'bold', halign: 'center' },
            columnStyles: {
                0: { halign: 'center', cellWidth: 10 },
                1: { cellWidth: 80 },
                2: { halign: 'center', cellWidth: 22 },
                3: { halign: 'right', cellWidth: 30 },
                4: { halign: 'right', cellWidth: 30 },
            },
            alternateRowStyles: { fillColor: [250, 250, 250] },
            margin: { left: 14, right: 14 },
        });

        // ── Totals box ───────────────────────────────────────
        const finalY = doc.lastAutoTable.finalY + 6;

        // Payment info
        doc.setFontSize(9);
        doc.setTextColor(120, 120, 120);
        doc.text('Payment Method:', 14, finalY + 6);
        doc.setTextColor(30, 30, 30);
        doc.setFont('helvetica', 'bold');
        doc.text(order.paymentMethod || 'N/A', 55, finalY + 6);

        doc.setFont('helvetica', 'normal');
        doc.setTextColor(120, 120, 120);
        doc.text('Payment Status:', 14, finalY + 13);
        doc.setTextColor(30, 30, 30);
        doc.setFont('helvetica', 'bold');
        doc.text(order.paymentStatus || 'N/A', 55, finalY + 13);

        // Total box on right
        doc.setFillColor(30, 30, 30);
        doc.roundedRect(pageW - 80, finalY, 66, 22, 3, 3, 'F');
        doc.setTextColor(160, 160, 160);
        doc.setFontSize(8);
        doc.setFont('helvetica', 'normal');
        doc.text('TOTAL AMOUNT', pageW - 47, finalY + 8, { align: 'center' });
        doc.setTextColor(255, 140, 50);
        doc.setFontSize(14);
        doc.setFont('helvetica', 'bold');
        doc.text(`Rs. ${order.totalPrice?.toLocaleString('en-IN') || 0}`, pageW - 47, finalY + 17, { align: 'center' });

        // ── Order status ─────────────────────────────────────
        doc.setFontSize(9);
        doc.setTextColor(120, 120, 120);
        doc.setFont('helvetica', 'normal');
        doc.text(`Order Status: ${order.status}`, 14, finalY + 30);

        // ── Footer ───────────────────────────────────────────
        const footerY = doc.internal.pageSize.getHeight() - 18;
        doc.setFillColor(245, 245, 245);
        doc.rect(0, footerY - 4, pageW, 22, 'F');
        doc.setFontSize(8);
        doc.setTextColor(120, 120, 120);
        doc.text('Thank you for your business with GJ TEX!', pageW / 2, footerY + 2, { align: 'center' });
        doc.setFontSize(7);
        doc.text('For queries contact: gjatex@gmail.com | Tiruppur, Tamil Nadu', pageW / 2, footerY + 8, { align: 'center' });

        doc.save(`GJ-TEX-Invoice-${order._id?.substring(0, 8)}.pdf`);
        setDownloadingId(null);
    };

    /* ─── Render ─────────────────────────────────────────── */
    return (
        <div style={{ background: 'linear-gradient(135deg, #f8f9ff 0%, #fff7f0 100%)', minHeight: '100vh' }} className="py-10">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">

                {/* ── Hero header ──────────────────────────── */}
                <div className="relative overflow-hidden rounded-3xl mb-8 p-8 sm:p-10"
                    style={{ background: 'linear-gradient(135deg, #1a1a1a 0%, #2d1a00 60%, #1a1a1a 100%)' }}>
                    {/* Decorative blobs */}
                    <div className="absolute top-0 right-0 w-72 h-72 rounded-full opacity-10"
                        style={{ background: 'radial-gradient(circle, #ff6b00, transparent)', transform: 'translate(30%, -30%)' }} />
                    <div className="absolute bottom-0 left-0 w-48 h-48 rounded-full opacity-10"
                        style={{ background: 'radial-gradient(circle, #ff4500, transparent)', transform: 'translate(-30%, 30%)' }} />

                    <div className="relative z-10 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                        <div>
                            <div className="flex items-center gap-2 mb-1">
                                <span className="text-xs font-bold bg-orange-500/20 text-orange-400 border border-orange-500/30 px-3 py-1 rounded-full uppercase tracking-wider">
                                    My Account
                                </span>
                            </div>
                            <h1 className="text-3xl sm:text-4xl font-bold text-white mt-2">
                                Welcome back, <span style={{ color: '#ff8c32' }}>{user.name}</span>
                            </h1>
                            <p className="text-gray-400 mt-1">Here's a summary of all your wholesale orders.</p>
                        </div>
                        <div className="flex items-center gap-2">
                            <div className="w-14 h-14 rounded-2xl flex items-center justify-center text-white text-2xl font-bold shadow-lg"
                                style={{ background: 'linear-gradient(135deg, #ff6b00, #e53e00)' }}>
                                {user.name.charAt(0).toUpperCase()}
                            </div>
                        </div>
                    </div>

                    {/* Stats row */}
                    <div className="relative z-10 grid grid-cols-3 gap-4 mt-8">
                        {[
                            { label: 'Total Orders', value: orders.length, icon: <ShoppingBag size={18} />, color: '#ff8c32' },
                            { label: 'Active Orders', value: activeOrders, icon: <TrendingUp size={18} />, color: '#60a5fa' },
                            { label: 'Total Spent', value: `₹${totalSpent.toLocaleString()}`, icon: <IndianRupee size={18} />, color: '#34d399' },
                        ].map(stat => (
                            <div key={stat.label} className="bg-white/5 border border-white/10 rounded-2xl p-4 text-center backdrop-blur-sm">
                                <div className="flex justify-center mb-2" style={{ color: stat.color }}>{stat.icon}</div>
                                <p className="text-xl font-bold text-white">{stat.value}</p>
                                <p className="text-xs text-gray-400 mt-0.5">{stat.label}</p>
                            </div>
                        ))}
                    </div>
                </div>

                {/* ── Orders table ─────────────────────────── */}
                <div className="bg-white rounded-3xl shadow-sm border border-gray-100 overflow-hidden">
                    <div className="px-6 py-5 border-b border-gray-100 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                        <div className="flex items-center gap-3">
                            <div className="w-10 h-10 rounded-xl flex items-center justify-center" style={{ background: 'linear-gradient(135deg, #ff6b00, #e53e00)' }}>
                                <FileText size={18} className="text-white" />
                            </div>
                            <div>
                                <h2 className="text-lg font-bold text-gray-900">My Orders</h2>
                                <p className="text-xs text-gray-400">{orders.length} order{orders.length !== 1 ? 's' : ''} placed</p>
                            </div>
                        </div>
                        <span className="inline-flex items-center gap-1.5 bg-orange-50 text-orange-600 border border-orange-200 px-3 py-1.5 rounded-full text-xs font-semibold">
                            {totalItems} pcs total
                        </span>
                    </div>

                    {loading ? (
                        <div className="p-16 flex flex-col items-center gap-4">
                            <div className="w-10 h-10 border-4 border-gray-100 border-t-orange-500 rounded-full animate-spin" />
                            <p className="text-sm text-gray-400">Loading your orders…</p>
                        </div>
                    ) : orders.length === 0 ? (
                        <div className="p-16 text-center">
                            <div className="w-20 h-20 rounded-full bg-gray-50 flex items-center justify-center mx-auto mb-4">
                                <Package size={36} className="text-gray-300" />
                            </div>
                            <h3 className="text-lg font-semibold text-gray-800 mb-1">No Orders Yet</h3>
                            <p className="text-sm text-gray-400">You haven't placed any bulk wholesale orders yet.</p>
                        </div>
                    ) : (
                        <div className="overflow-x-auto">
                            <table className="w-full text-left">
                                <thead>
                                    <tr className="bg-gray-50 text-gray-400 text-xs uppercase tracking-wider">
                                        <th className="px-5 py-4 font-semibold">Order ID</th>
                                        <th className="px-5 py-4 font-semibold">Date</th>
                                        <th className="px-5 py-4 font-semibold">Product</th>
                                        <th className="px-5 py-4 font-semibold text-center">Qty</th>
                                        <th className="px-5 py-4 font-semibold text-right">Total</th>
                                        <th className="px-5 py-4 font-semibold text-center">Status</th>
                                        <th className="px-5 py-4 font-semibold text-center">Invoice</th>
                                        <th className="px-5 py-4 font-semibold text-center">Reorder</th>
                                    </tr>
                                </thead>
                                <tbody className="divide-y divide-gray-50">
                                    {orders.map(order => (
                                        <tr
                                            key={order._id}
                                            onClick={() => setSelectedOrder(order)}
                                            className="hover:bg-orange-50/40 transition-colors cursor-pointer group"
                                        >
                                            <td className="px-5 py-4">
                                                <span className="font-mono text-xs bg-gray-100 text-gray-600 px-2 py-1 rounded-lg group-hover:bg-orange-100 group-hover:text-orange-700 transition-colors">
                                                    #{order._id.substring(0, 8).toUpperCase()}
                                                </span>
                                            </td>
                                            <td className="px-5 py-4 text-sm text-gray-500">
                                                {new Date(order.createdAt).toLocaleDateString('en-IN', { day: '2-digit', month: 'short', year: 'numeric' })}
                                            </td>
                                            <td className="px-5 py-4 text-sm font-medium text-gray-800">
                                                {order.orderItems?.[0]?.product?.title || 'N/A'}
                                                {order.orderItems?.length > 1 && (
                                                    <span className="text-gray-400 text-xs ml-2">+{order.orderItems.length - 1} more</span>
                                                )}
                                            </td>
                                            <td className="px-5 py-4 text-sm text-gray-600 text-center">
                                                {order.orderItems?.reduce((s, i) => s + i.quantity, 0) || 0}
                                                <span className="text-xs text-gray-400 ml-1">pcs</span>
                                            </td>
                                            <td className="px-5 py-4 text-sm font-bold text-gray-900 text-right">
                                                ₹{order.totalPrice?.toLocaleString('en-IN')}
                                            </td>
                                            <td className="px-5 py-4 text-center">
                                                {getStatusBadge(order.status)}
                                            </td>
                                            <td className="px-5 py-4 text-center">
                                                <button
                                                    onClick={(e) => downloadInvoice(order, e)}
                                                    disabled={downloadingId === order._id}
                                                    className="inline-flex items-center gap-1.5 text-xs font-semibold px-3 py-1.5 rounded-xl border transition-all duration-200"
                                                    style={{
                                                        background: downloadingId === order._id ? '#f3f4f6' : 'linear-gradient(135deg, #ff6b00, #e53e00)',
                                                        color: downloadingId === order._id ? '#9ca3af' : 'white',
                                                        borderColor: downloadingId === order._id ? '#e5e7eb' : 'transparent',
                                                        boxShadow: downloadingId !== order._id ? '0 2px 8px rgba(255,107,0,0.35)' : 'none',
                                                    }}
                                                    title="Download Invoice PDF"
                                                >
                                                    <Download size={13} />
                                                    {downloadingId === order._id ? 'Saving…' : 'PDF'}
                                                </button>
                                            </td>
                                            <td className="px-5 py-4 text-center">
                                                <button
                                                    onClick={(e) => handleReorder(order, e)}
                                                    disabled={reorderingId === order._id || !order.orderItems?.some(i => i.product)}
                                                    title="Reorder same items"
                                                    className="inline-flex items-center gap-1.5 text-xs font-semibold px-3 py-1.5 rounded-xl border border-blue-200 bg-blue-50 text-blue-600 hover:bg-blue-100 transition-all duration-200 disabled:opacity-40"
                                                >
                                                    <RefreshCw size={13} className={reorderingId === order._id ? 'animate-spin' : ''} />
                                                    Reorder
                                                </button>
                                            </td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        </div>
                    )}
                </div>
            </div>

            {/* ── ORDER DETAILS MODAL ───────────────────────── */}
            {selectedOrder && (
                <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4"
                    onClick={() => setSelectedOrder(null)}>
                    <div
                        className="bg-white rounded-3xl shadow-2xl w-full max-w-3xl max-h-[90vh] overflow-y-auto animate-fade-in-up"
                        onClick={e => e.stopPropagation()}
                    >
                        {/* Modal header */}
                        <div className="flex justify-between items-center p-6 border-b border-gray-100 sticky top-0 bg-white z-10 rounded-t-3xl">
                            <div className="flex items-center gap-3">
                                <div className="w-10 h-10 rounded-xl flex items-center justify-center"
                                    style={{ background: 'linear-gradient(135deg, #ff6b00, #e53e00)' }}>
                                    <Package size={18} className="text-white" />
                                </div>
                                <div>
                                    <h2 className="font-bold text-gray-900 text-lg">Order Details</h2>
                                    <p className="text-xs text-gray-400 font-mono">#{selectedOrder._id.toUpperCase()}</p>
                                </div>
                            </div>
                            <div className="flex items-center gap-2">
                                <button
                                    onClick={(e) => downloadInvoice(selectedOrder, e)}
                                    disabled={downloadingId === selectedOrder._id}
                                    className="inline-flex items-center gap-2 text-sm font-semibold px-4 py-2 rounded-xl transition-all duration-200"
                                    style={{
                                        background: 'linear-gradient(135deg, #ff6b00, #e53e00)',
                                        color: 'white',
                                        boxShadow: '0 4px 12px rgba(255,107,0,0.35)',
                                    }}
                                >
                                    <Download size={15} />
                                    {downloadingId === selectedOrder._id ? 'Generating…' : 'Download Invoice'}
                                </button>
                                <button onClick={() => setSelectedOrder(null)}
                                    className="p-2 rounded-xl text-gray-400 hover:text-gray-700 hover:bg-gray-100 transition-colors">
                                    <X size={20} />
                                </button>
                            </div>
                        </div>

                        <div className="p-6 sm:p-8 space-y-8">

                            {/* Tracking Timeline */}
                            <div>
                                <h3 className="text-xs font-bold text-gray-400 uppercase tracking-widest mb-6">Order Tracking</h3>
                                {selectedOrder.status === 'Cancelled' ? (
                                    <div className="flex flex-col items-center justify-center py-6 bg-red-50 rounded-2xl border border-red-100">
                                        <XCircle size={40} className="text-red-400 mb-2" />
                                        <p className="font-bold text-gray-800">Order Cancelled</p>
                                        <p className="text-sm text-gray-400 mt-1">This order has been cancelled.</p>
                                    </div>
                                ) : (
                                    <div className="relative">
                                        <div className="absolute top-5 left-0 w-full h-1 bg-gray-100 rounded-full z-0" />
                                        <div
                                            className="absolute top-5 left-0 h-1 rounded-full z-0 transition-all duration-700"
                                            style={{
                                                width: `${getTimelineProgress(selectedOrder.status)}%`,
                                                background: 'linear-gradient(90deg, #ff6b00, #e53e00)',
                                            }}
                                        />
                                        <div className="relative z-10 flex justify-between">
                                            {[
                                                { step: 'Ordered', statuses: ['Ordered', 'Under Process', 'Shipped', 'Delivered'], icon: <Clock size={16} />, color: '#f97316' },
                                                { step: 'Under Process', statuses: ['Under Process', 'Shipped', 'Delivered'], icon: <Package size={16} />, color: '#3b82f6' },
                                                { step: 'Shipped', statuses: ['Shipped', 'Delivered'], icon: <Truck size={16} />, color: '#a855f7' },
                                                { step: 'Delivered', statuses: ['Delivered'], icon: <CheckCircle size={16} />, color: '#10b981' },
                                            ].map(({ step, statuses, icon, color }) => {
                                                const active = statuses.includes(selectedOrder.status);
                                                return (
                                                    <div key={step} className="flex flex-col items-center gap-2">
                                                        <div
                                                            className="w-10 h-10 rounded-full flex items-center justify-center shadow-sm border-2 border-white transition-all duration-300"
                                                            style={{ background: active ? color : '#e5e7eb', color: active ? '#fff' : '#9ca3af' }}
                                                        >
                                                            {icon}
                                                        </div>
                                                        <p className={`text-[11px] font-bold text-center ${active ? 'text-gray-800' : 'text-gray-400'}`}>
                                                            {step.split(' ').map((w, i) => <span key={i} className="block">{w}</span>)}
                                                        </p>
                                                    </div>
                                                );
                                            })}
                                        </div>
                                    </div>
                                )}
                            </div>

                            {/* Info grid */}
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                {/* Shipping */}
                                <div className="bg-gray-50 rounded-2xl p-5 border border-gray-100">
                                    <h3 className="text-xs font-bold text-gray-400 uppercase tracking-widest mb-4">Shipping Info</h3>
                                    <p className="font-bold text-gray-900">{selectedOrder.contactDetails?.name}</p>
                                    <p className="text-sm text-gray-500">{selectedOrder.contactDetails?.companyName}</p>
                                    <p className="text-sm text-gray-500 mt-1">{selectedOrder.contactDetails?.email}</p>
                                    <p className="text-sm text-gray-500">{selectedOrder.contactDetails?.phone}</p>
                                    {selectedOrder.customizationDetails && (
                                        <div className="mt-3 flex items-start gap-2 bg-white rounded-xl p-3 border border-gray-100">
                                            <MapPin size={14} className="text-gray-400 mt-0.5 flex-shrink-0" />
                                            <p className="text-xs text-gray-500 leading-relaxed">
                                                {selectedOrder.customizationDetails.replace('Delivery Address: ', '')}
                                            </p>
                                        </div>
                                    )}
                                </div>

                                {/* Payment */}
                                <div className="bg-gray-50 rounded-2xl p-5 border border-gray-100">
                                    <h3 className="text-xs font-bold text-gray-400 uppercase tracking-widest mb-4">Payment Details</h3>
                                    <div className="space-y-3">
                                        {[
                                            { label: 'Method', value: selectedOrder.paymentMethod },
                                            { label: 'Status', value: selectedOrder.paymentStatus },
                                            { label: 'Placed On', value: new Date(selectedOrder.createdAt).toLocaleDateString('en-IN', { day: '2-digit', month: 'long', year: 'numeric' }) },
                                        ].map(({ label, value }) => (
                                            <div key={label} className="flex justify-between items-center text-sm">
                                                <span className="text-gray-400">{label}</span>
                                                <span className="font-semibold text-gray-800">{value}</span>
                                            </div>
                                        ))}
                                        <div className="mt-3 pt-3 border-t border-gray-200 flex justify-between items-center">
                                            <span className="font-bold text-gray-900">Total</span>
                                            <span className="text-xl font-bold" style={{ color: '#ff6b00' }}>
                                                ₹{selectedOrder.totalPrice?.toLocaleString('en-IN')}
                                            </span>
                                        </div>
                                    </div>
                                </div>
                            </div>

                            {/* Items */}
                            <div>
                                <h3 className="text-xs font-bold text-gray-400 uppercase tracking-widest mb-4">Items Ordered</h3>
                                <div className="space-y-2">
                                    {selectedOrder.orderItems?.length > 0 ? (
                                        selectedOrder.orderItems.map((item, i) => (
                                            <div key={i} className="flex items-center justify-between bg-gray-50 hover:bg-orange-50 transition-colors p-4 rounded-2xl border border-gray-100">
                                                <div className="flex items-center gap-3">
                                                    <div className="w-10 h-10 rounded-xl flex items-center justify-center text-white text-sm font-bold"
                                                        style={{ background: 'linear-gradient(135deg, #ff6b00, #e53e00)' }}>
                                                        {i + 1}
                                                    </div>
                                                    <div>
                                                        <p className="font-semibold text-gray-900 text-sm">{item.product?.title || 'Unknown Product'}</p>
                                                        <p className="text-xs text-gray-400">₹{item.price?.toLocaleString('en-IN')} per piece</p>
                                                    </div>
                                                </div>
                                                <div className="text-right">
                                                    <p className="font-bold text-gray-900">{item.quantity} <span className="text-xs text-gray-400 font-normal">pcs</span></p>
                                                    <p className="text-xs text-gray-500">₹{((item.price || 0) * item.quantity).toLocaleString('en-IN')}</p>
                                                </div>
                                            </div>
                                        ))
                                    ) : (
                                        <div className="text-center py-8 bg-gray-50 rounded-2xl text-gray-400 text-sm">
                                            Legacy order format — item details unavailable.
                                        </div>
                                    )}
                                </div>
                            </div>

                            {/* Tracking History Log */}
                            {selectedOrder.trackingHistory?.length > 0 && (
                                <div>
                                    <h3 className="text-xs font-bold text-gray-400 uppercase tracking-widest mb-4 flex items-center gap-2">
                                        <History size={14} /> Status History
                                    </h3>
                                    <div className="space-y-2">
                                        {[...selectedOrder.trackingHistory].reverse().map((entry, i) => (
                                            <div key={i} className="flex items-start gap-3 bg-gray-50 rounded-xl p-3 border border-gray-100">
                                                <div className="w-2 h-2 rounded-full mt-1.5 flex-shrink-0" style={{ background: '#ff6b00' }} />
                                                <div className="flex-1">
                                                    <div className="flex items-center justify-between">
                                                        <span className="text-xs font-bold text-gray-800">{entry.status}</span>
                                                        <span className="text-[10px] text-gray-400">
                                                            {new Date(entry.updatedAt).toLocaleString('en-IN', { day: '2-digit', month: 'short', year: 'numeric', hour: '2-digit', minute: '2-digit' })}
                                                        </span>
                                                    </div>
                                                    {entry.note && <p className="text-xs text-gray-500 mt-0.5">{entry.note}</p>}
                                                </div>
                                            </div>
                                        ))}
                                    </div>
                                </div>
                            )}

                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};

export default Dashboard;
