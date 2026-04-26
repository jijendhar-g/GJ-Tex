import express from 'express';
import dotenv from 'dotenv';
import cors from 'cors';
import connectDB from './config/db.js';
import path from 'path';
import { fileURLToPath } from 'url';
import Ad from './models/Ad.js';

// Route imports
import authRoutes from './routes/auth.routes.js';
import productRoutes from './routes/product.routes.js';
import orderRoutes from './routes/order.routes.js';
import adminRoutes from './routes/admin.routes.js';
import paymentRoutes from './routes/payment.routes.js';

dotenv.config();

const app = express();
const PORT = process.env.PORT || 5000;

// Default ads to auto-seed
const DEFAULT_ADS = [
    { title: 'Summer Sale — Up to 30% Off', subtitle: 'Bulk orders on T-Shirts & Hoodies at unbeatable prices.', badge: '🔥 HOT DEAL', bgColor: '#1a1a1a', accentColor: '#ff6b00', ctaText: 'Shop Now', ctaLink: '/products', isActive: true, order: 1 },
    { title: 'New Sportswear Collection', subtitle: 'Moisture-wicking fabric, custom branding available. MOQ just 50 pcs.', badge: '✨ NEW ARRIVAL', bgColor: '#0f172a', accentColor: '#6366f1', ctaText: 'Explore', ctaLink: '/products', isActive: true, order: 2 },
    { title: 'Free Shipping on Orders ₹50,000+', subtitle: 'Pan-India delivery at zero cost. Place your bulk order today!', badge: '🚚 FREE SHIPPING', bgColor: '#14532d', accentColor: '#22c55e', ctaText: 'Order Now', ctaLink: '/bulk-order', isActive: true, order: 3 },
    { title: 'Custom Embroidery & Printing', subtitle: 'Your logo, your colors — we handle it all. Min 100 pcs per design.', badge: '🎨 CUSTOMIZE', bgColor: '#1e1b4b', accentColor: '#a855f7', ctaText: 'Get Quote', ctaLink: '/bulk-order', isActive: true, order: 4 },
    { title: 'Kids Collection — Soft & Safe', subtitle: 'OEKO-TEX certified fabrics. Gentle on skin, strong on quality.', badge: '👶 KIDSWEAR', bgColor: '#431407', accentColor: '#fb923c', ctaText: 'View Range', ctaLink: '/products', isActive: true, order: 5 },
];

// Auto-seed default ads into the database
const seedDefaultAds = async () => {
    try {
        const existingAds = await Ad.find({});
        const missingAds = DEFAULT_ADS.filter(def => !existingAds.some(a => a.title === def.title));
        if (missingAds.length > 0) {
            await Ad.insertMany(missingAds);
            console.log(`✅ Auto-seeded ${missingAds.length} default banner ads.`);
        } else {
            console.log(`✅ All ${DEFAULT_ADS.length} default banner ads already exist.`);
        }
    } catch (err) {
        console.error('⚠️  Failed to seed default ads:', err.message);
    }
};

// Connect to database then seed defaults
connectDB().then(() => {
    seedDefaultAds();
});

// Middleware
app.use(cors({
    origin: [
        'http://localhost:5173',
        'https://gjtex-garments.vercel.app'  // your Vercel URL
    ],
    credentials: true
}));
app.use(express.json());

// Static folder for uploaded images
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
app.use('/uploads', express.static(path.join(__dirname, 'uploads')));

// API Routes
app.use('/api/auth', authRoutes);
app.use('/api/products', productRoutes);
app.use('/api/orders', orderRoutes);
app.use('/api/admin', adminRoutes);
app.use('/api/payment', paymentRoutes);

app.get('/', (req, res) => {
    res.send('Tiruppur Garments B2B API is running...');
});

app.listen(PORT, () => {
    console.log(`Server running on port ${PORT}`);
});
