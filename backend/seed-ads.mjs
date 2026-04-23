import mongoose from 'mongoose';
import dotenv from 'dotenv';
dotenv.config();

const adSchema = new mongoose.Schema({
    title: { type: String, required: true },
    subtitle: { type: String, default: '' },
    badge: { type: String, default: '' },
    bgColor: { type: String, default: '#1a1a1a' },
    accentColor: { type: String, default: '#ff6b00' },
    ctaText: { type: String, default: 'Shop Now' },
    ctaLink: { type: String, default: '/products' },
    isActive: { type: Boolean, default: true },
    order: { type: Number, default: 0 },
}, { timestamps: true });

const Ad = mongoose.model('Ad', adSchema);

const DEFAULT_ADS = [
    { title: 'Summer Sale — Up to 30% Off', subtitle: 'Bulk orders on T-Shirts & Hoodies at unbeatable prices.', badge: '🔥 HOT DEAL', bgColor: '#1a1a1a', accentColor: '#ff6b00', ctaText: 'Shop Now', ctaLink: '/products', isActive: true, order: 1 },
    { title: 'New Sportswear Collection', subtitle: 'Moisture-wicking fabric, custom branding available. MOQ just 50 pcs.', badge: '✨ NEW ARRIVAL', bgColor: '#0f172a', accentColor: '#6366f1', ctaText: 'Explore', ctaLink: '/products', isActive: true, order: 2 },
    { title: 'Free Shipping on Orders ₹50,000+', subtitle: 'Pan-India delivery at zero cost. Place your bulk order today!', badge: '🚚 FREE SHIPPING', bgColor: '#14532d', accentColor: '#22c55e', ctaText: 'Order Now', ctaLink: '/bulk-order', isActive: true, order: 3 },
    { title: 'Custom Embroidery & Printing', subtitle: 'Your logo, your colors — we handle it all. Min 100 pcs per design.', badge: '🎨 CUSTOMIZE', bgColor: '#1e1b4b', accentColor: '#a855f7', ctaText: 'Get Quote', ctaLink: '/bulk-order', isActive: true, order: 4 },
    { title: 'Kids Collection — Soft & Safe', subtitle: 'OEKO-TEX certified fabrics. Gentle on skin, strong on quality.', badge: '👶 KIDSWEAR', bgColor: '#431407', accentColor: '#fb923c', ctaText: 'View Range', ctaLink: '/products', isActive: true, order: 5 },
];

async function seedAds() {
    try {
        console.log('Connecting to MongoDB...');
        await mongoose.connect(process.env.MONGO_URI);
        console.log('Connected!');

        const existingAds = await Ad.find({});
        console.log(`Found ${existingAds.length} existing ads in database.`);

        const missingAds = DEFAULT_ADS.filter(def => !existingAds.some(a => a.title === def.title));

        if (missingAds.length > 0) {
            const inserted = await Ad.insertMany(missingAds);
            console.log(`✅ Inserted ${inserted.length} default ads:`);
            inserted.forEach(ad => console.log(`   - ${ad.title}`));
        } else {
            console.log('✅ All default ads already exist in the database.');
        }

        const allAds = await Ad.find({}).sort({ order: 1 });
        console.log(`\nTotal ads in database now: ${allAds.length}`);
        allAds.forEach(ad => console.log(`   [${ad.isActive ? '✓' : '✗'}] ${ad.title} (bg: ${ad.bgColor})`));

        await mongoose.disconnect();
        console.log('\nDone! Disconnected.');
        process.exit(0);
    } catch (err) {
        console.error('Error seeding ads:', err.message);
        process.exit(1);
    }
}

seedAds();
