import mongoose from 'mongoose';

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
export default Ad;
