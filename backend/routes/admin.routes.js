import express from 'express';
import { protect, admin } from '../middleware/auth.middleware.js';
import { upload } from '../middleware/upload.middleware.js';
import User from '../models/User.js';
import Order from '../models/Order.js';
import Product from '../models/Product.js';
import Category from '../models/Category.js';
import Ad from '../models/Ad.js';

const router = express.Router();

// ═══════════════ DASHBOARD STATS ═══════════════
router.get('/stats', protect, admin, async (req, res) => {
    try {
        const totalOrders = await Order.countDocuments();
        const totalUsers = await User.countDocuments({ role: 'customer' });
        const totalProducts = await Product.countDocuments();
        const totalCategories = await Category.countDocuments();
        const pendingOrders = await Order.countDocuments({ status: 'Pending' });
        const processingOrders = await Order.countDocuments({ status: 'Processing' });
        const completedOrders = await Order.countDocuments({ status: 'Completed' });

        res.json({
            totalOrders,
            totalUsers,
            totalProducts,
            totalCategories,
            pendingOrders,
            processingOrders,
            completedOrders
        });
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
});

// ═══════════════ ANALYTICS ═══════════════
router.get('/analytics', protect, admin, async (req, res) => {
    try {
        // Monthly revenue for last 6 months
        const sixMonthsAgo = new Date();
        sixMonthsAgo.setMonth(sixMonthsAgo.getMonth() - 5);
        sixMonthsAgo.setDate(1);
        sixMonthsAgo.setHours(0, 0, 0, 0);

        const monthlyRaw = await Order.aggregate([
            { $match: { createdAt: { $gte: sixMonthsAgo }, status: { $ne: 'Cancelled' } } },
            {
                $group: {
                    _id: { year: { $year: '$createdAt' }, month: { $month: '$createdAt' } },
                    revenue: { $sum: '$totalPrice' },
                    orders: { $sum: 1 }
                }
            },
            { $sort: { '_id.year': 1, '_id.month': 1 } }
        ]);

        const months = [];
        for (let i = 5; i >= 0; i--) {
            const d = new Date();
            d.setMonth(d.getMonth() - i);
            const y = d.getFullYear();
            const m = d.getMonth() + 1;
            const found = monthlyRaw.find(r => r._id.year === y && r._id.month === m);
            months.push({
                month: d.toLocaleString('en-IN', { month: 'short' }) + ' ' + y,
                revenue: found?.revenue || 0,
                orders: found?.orders || 0
            });
        }

        // Daily revenue for last 30 days
        const thirtyDaysAgo = new Date();
        thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 29);
        thirtyDaysAgo.setHours(0, 0, 0, 0);

        const dailyRaw = await Order.aggregate([
            { $match: { createdAt: { $gte: thirtyDaysAgo }, status: { $ne: 'Cancelled' } } },
            {
                $group: {
                    _id: { year: { $year: '$createdAt' }, month: { $month: '$createdAt' }, day: { $dayOfMonth: '$createdAt' } },
                    revenue: { $sum: '$totalPrice' },
                    orders: { $sum: 1 }
                }
            },
            { $sort: { '_id.year': 1, '_id.month': 1, '_id.day': 1 } }
        ]);

        const days = [];
        for (let i = 29; i >= 0; i--) {
            const d = new Date();
            d.setDate(d.getDate() - i);
            const y = d.getFullYear();
            const m = d.getMonth() + 1;
            const day = d.getDate();
            const found = dailyRaw.find(r => r._id.year === y && r._id.month === m && r._id.day === day);
            days.push({
                date: d.toLocaleDateString('en-IN', { day: '2-digit', month: 'short' }),
                revenue: found?.revenue || 0,
                orders: found?.orders || 0
            });
        }

        // Top 5 products by quantity ordered
        const topProducts = await Order.aggregate([
            { $unwind: '$orderItems' },
            { $group: { _id: '$orderItems.product', totalQty: { $sum: '$orderItems.quantity' }, totalRevenue: { $sum: { $multiply: ['$orderItems.price', '$orderItems.quantity'] } } } },
            { $sort: { totalQty: -1 } },
            { $limit: 5 },
            { $lookup: { from: 'products', localField: '_id', foreignField: '_id', as: 'product' } },
            { $unwind: '$product' },
            { $project: { name: '$product.title', totalQty: 1, totalRevenue: 1 } }
        ]);

        // ALL products by revenue (for product-wise revenue chart)
        const productRevenue = await Order.aggregate([
            { $match: { status: { $ne: 'Cancelled' } } },
            { $unwind: '$orderItems' },
            { $group: { _id: '$orderItems.product', totalQty: { $sum: '$orderItems.quantity' }, totalRevenue: { $sum: { $multiply: ['$orderItems.price', '$orderItems.quantity'] } } } },
            { $sort: { totalRevenue: -1 } },
            { $limit: 10 },
            { $lookup: { from: 'products', localField: '_id', foreignField: '_id', as: 'product' } },
            { $unwind: '$product' },
            { $project: { name: '$product.title', totalQty: 1, totalRevenue: 1 } }
        ]);

        // Order status breakdown
        const statusBreakdown = await Order.aggregate([
            { $group: { _id: '$status', count: { $sum: 1 } } }
        ]);

        // Total revenue
        const totalRevenueAgg = await Order.aggregate([
            { $match: { status: { $ne: 'Cancelled' } } },
            { $group: { _id: null, total: { $sum: '$totalPrice' } } }
        ]);
        const totalRevenue = totalRevenueAgg[0]?.total || 0;

        // Today's revenue
        const todayStart = new Date();
        todayStart.setHours(0, 0, 0, 0);
        const todayRevenueAgg = await Order.aggregate([
            { $match: { createdAt: { $gte: todayStart }, status: { $ne: 'Cancelled' } } },
            { $group: { _id: null, total: { $sum: '$totalPrice' }, count: { $sum: 1 } } }
        ]);
        const todayRevenue = todayRevenueAgg[0]?.total || 0;
        const todayOrders = todayRevenueAgg[0]?.count || 0;

        res.json({ monthlyRevenue: months, dailyRevenue: days, topProducts, productRevenue, statusBreakdown, totalRevenue, todayRevenue, todayOrders });
    } catch (error) {
        res.status(500).json({ message: error.message });

    }
});

// ═══════════════ IMAGE UPLOAD ═══════════════
router.post('/upload', protect, admin, upload.array('images', 5), async (req, res) => {
    try {
        if (!req.files || req.files.length === 0) {
            return res.status(400).json({ message: 'No files uploaded' });
        }
        const urls = req.files.map(f => f.path);
        res.json({ urls, message: `${urls.length} image(s) uploaded successfully` });
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
});

// ═══════════════ MIGRATE OLD PRODUCTS (fix qty=0 → 9999) ═══════════════
// Run once to fix products that were created before availableQuantity tracking
router.post('/migrate-qty', protect, admin, async (req, res) => {
    try {
        const result = await Product.updateMany(
            { availableQuantity: { $in: [0, null] } },
            { $set: { availableQuantity: 9999 } }
        );
        res.json({
            message: `Migration complete. Updated ${result.modifiedCount} products to default 9999 qty.`,
            modifiedCount: result.modifiedCount
        });
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
});

// ═══════════════ USER MANAGEMENT ═══════════════
router.get('/users', protect, admin, async (req, res) => {
    try {
        const users = await User.find({}).select('-password');
        res.json(users);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
});

router.delete('/users/:id', protect, admin, async (req, res) => {
    try {
        const user = await User.findById(req.params.id);
        if (user) {
            if (user.role === 'admin') {
                return res.status(400).json({ message: 'Cannot delete admin user' });
            }
            await User.deleteOne({ _id: user._id });
            res.json({ message: 'User removed' });
        } else {
            res.status(404).json({ message: 'User not found' });
        }
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
});

// ═══════════════ CATEGORY MANAGEMENT ═══════════════
router.get('/categories', protect, admin, async (req, res) => {
    try {
        const categories = await Category.find({});
        res.json(categories);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
});

// Public categories route
router.get('/categories/public', async (req, res) => {
    try {
        const categories = await Category.find({});
        res.json(categories);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
});

router.post('/categories', protect, admin, async (req, res) => {
    try {
        const { name, description } = req.body;
        const category = await Category.create({ name, description });
        res.status(201).json(category);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
});

router.put('/categories/:id', protect, admin, async (req, res) => {
    try {
        const category = await Category.findById(req.params.id);
        if (category) {
            category.name = req.body.name || category.name;
            category.description = req.body.description || category.description;
            const updated = await category.save();
            res.json(updated);
        } else {
            res.status(404).json({ message: 'Category not found' });
        }
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
});

router.delete('/categories/:id', protect, admin, async (req, res) => {
    try {
        const category = await Category.findById(req.params.id);
        if (category) {
            await Category.deleteOne({ _id: category._id });
            res.json({ message: 'Category removed' });
        } else {
            res.status(404).json({ message: 'Category not found' });
        }
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
});

// ═══════════════ ADS / OFFERS MANAGEMENT ═══════════════
// Public: get all active ads (for homepage carousel)
// Default fallback ads for auto-seeding
const DEFAULT_ADS = [
    { title: 'Summer Sale — Up to 30% Off', subtitle: 'Bulk orders on T-Shirts & Hoodies at unbeatable prices.', badge: '🔥 HOT DEAL', bgColor: '#1a1a1a', accentColor: '#ff6b00', ctaText: 'Shop Now', ctaLink: '/products', isActive: true, order: 1 },
    { title: 'New Sportswear Collection', subtitle: 'Moisture-wicking fabric, custom branding available. MOQ just 50 pcs.', badge: '✨ NEW ARRIVAL', bgColor: '#0f172a', accentColor: '#6366f1', ctaText: 'Explore', ctaLink: '/products', isActive: true, order: 2 },
    { title: 'Free Shipping on Orders ₹50,000+', subtitle: 'Pan-India delivery at zero cost. Place your bulk order today!', badge: '🚚 FREE SHIPPING', bgColor: '#14532d', accentColor: '#22c55e', ctaText: 'Order Now', ctaLink: '/bulk-order', isActive: true, order: 3 },
    { title: 'Custom Embroidery & Printing', subtitle: 'Your logo, your colors — we handle it all. Min 100 pcs per design.', badge: '🎨 CUSTOMIZE', bgColor: '#1e1b4b', accentColor: '#a855f7', ctaText: 'Get Quote', ctaLink: '/bulk-order', isActive: true, order: 4 },
    { title: 'Kids Collection — Soft & Safe', subtitle: 'OEKO-TEX certified fabrics. Gentle on skin, strong on quality.', badge: '👶 KIDSWEAR', bgColor: '#431407', accentColor: '#fb923c', ctaText: 'View Range', ctaLink: '/products', isActive: true, order: 5 },
];

router.get('/ads/public', async (req, res) => {
    try {
        let allAds = await Ad.find({});
        const missingAds = DEFAULT_ADS.filter(def => !allAds.some(a => a.title === def.title));
        if (missingAds.length > 0) {
            await Ad.insertMany(missingAds);
        }
        let ads = await Ad.find({ isActive: true }).sort({ order: 1, createdAt: 1 });
        res.json(ads);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
});

// Admin: get all ads
router.get('/ads', protect, admin, async (req, res) => {
    try {
        let allAds = await Ad.find({});
        const missingAds = DEFAULT_ADS.filter(def => !allAds.some(a => a.title === def.title));
        if (missingAds.length > 0) {
            await Ad.insertMany(missingAds);
        }
        let ads = await Ad.find({}).sort({ order: 1, createdAt: 1 });
        res.json(ads);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
});

// Admin: create ad
router.post('/ads', protect, admin, async (req, res) => {
    try {
        const ad = await Ad.create(req.body);
        res.status(201).json(ad);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
});

// Admin: update ad
router.put('/ads/:id', protect, admin, async (req, res) => {
    try {
        const ad = await Ad.findByIdAndUpdate(req.params.id, req.body, { new: true });
        if (!ad) return res.status(404).json({ message: 'Ad not found' });
        res.json(ad);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
});

// Admin: delete ad
router.delete('/ads/:id', protect, admin, async (req, res) => {
    try {
        const ad = await Ad.findByIdAndDelete(req.params.id);
        if (!ad) return res.status(404).json({ message: 'Ad not found' });
        res.json({ message: 'Ad removed' });
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
});

export default router;
