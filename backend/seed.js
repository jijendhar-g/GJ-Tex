import mongoose from 'mongoose';
import dotenv from 'dotenv';
import User from './models/User.js';
import Category from './models/Category.js';
import Product from './models/Product.js';

dotenv.config();

const seedDB = async () => {
    try {
        await mongoose.connect(process.env.MONGO_URI);
        console.log('MongoDB Connected for seeding...');

        // Check if database already has data (skip seeding to protect admin-added products)
        const existingProducts = await Product.countDocuments();
        const forceReseed = process.argv.includes('--force');

        if (existingProducts > 0 && !forceReseed) {
            console.log(`\n⚠️  Database already has ${existingProducts} products.`);
            console.log('   Products added via Admin Dashboard are preserved.');
            console.log('   To force re-seed (WARNING: deletes all data), run:');
            console.log('   node seed.js --force\n');
            process.exit(0);
        }

        // Clear existing data (only when force flag is used or DB is empty)
        await User.deleteMany({});
        await Category.deleteMany({});
        await Product.deleteMany({});
        console.log('Cleared existing data.');

        // ═══════════════ CREATE ADMIN USER ═══════════════
        const admin = await User.create({
            name: 'GJ TEX Admin',
            email: 'admin@gjtex.com',
            password: 'admin123',
            companyName: 'GJ TEX Manufacturing',
            phone: '+91 98765 43210',
            role: 'admin'
        });
        console.log('✅ Admin user created:');
        console.log('   Email: admin@gjtex.com');
        console.log('   Password: admin123');

        // ═══════════════ CREATE CATEGORIES ═══════════════
        const categories = await Category.insertMany([
            { name: 'T-Shirts', description: 'Premium cotton t-shirts for all occasions', image: '' },
            { name: 'Hoodies', description: 'Warm and stylish hoodies and sweatshirts', image: '' },
            { name: 'Sportswear', description: 'Performance sportswear and activewear', image: '' },
            { name: 'Kidswear', description: 'Comfortable and colorful kidswear', image: '' },
            { name: 'Custom Printing', description: 'Custom printed garments with your branding', image: '' },
        ]);
        console.log('✅ Categories created:', categories.map(c => c.name).join(', '));

        // ═══════════════ CREATE SAMPLE PRODUCTS ═══════════════
        const products = await Product.insertMany([
            {
                title: 'Premium Round Neck T-Shirt',
                description: 'High-quality 100% combed cotton round neck t-shirt. Bio-washed for extra softness. Perfect for brand printing and retail.',
                category: categories[0]._id,
                priceRange: { min: 120, max: 250 },
                moq: 100,
                fabricType: '100% Combed Cotton - 180 GSM',
                colors: ['White', 'Black', 'Navy Blue', 'Red', 'Grey'],
                sizes: ['S', 'M', 'L', 'XL', 'XXL'],
                images: ['/images/hero-garments.png'],
                isFeatured: true
            },
            {
                title: 'Classic Polo T-Shirt',
                description: 'Premium pique cotton polo t-shirt with ribbed collar. Ideal for corporate uniforms and retail brands.',
                category: categories[0]._id,
                priceRange: { min: 180, max: 350 },
                moq: 100,
                fabricType: 'Pique Cotton - 220 GSM',
                colors: ['White', 'Black', 'Royal Blue', 'Maroon'],
                sizes: ['S', 'M', 'L', 'XL', 'XXL'],
                images: ['/images/classicpolo.png'],
                isFeatured: true
            },
            {
                title: 'Pullover Hoodie',
                description: 'Heavy-weight fleece pullover hoodie with kangaroo pocket. Brushed interior for warmth. Screen printing available.',
                category: categories[1]._id,
                priceRange: { min: 350, max: 600 },
                moq: 50,
                fabricType: 'Cotton Fleece - 320 GSM',
                colors: ['Black', 'Grey Melange', 'Navy', 'Olive Green'],
                sizes: ['S', 'M', 'L', 'XL', 'XXL'],
                images: ['/images/hoodies.png'],
                isFeatured: true
            },
            {
                title: 'Zip-Up Track Jacket',
                description: 'Lightweight full-zip track jacket with moisture-wicking. Perfect for sports teams and athletic brands.',
                category: categories[2]._id,
                priceRange: { min: 280, max: 450 },
                moq: 100,
                fabricType: 'Polyester Dry-Fit - 150 GSM',
                colors: ['Black', 'Navy', 'Red', 'Royal Blue'],
                sizes: ['S', 'M', 'L', 'XL', 'XXL'],
                images: ['/images/sports.png'],
                isFeatured: false
            },
            {
                title: 'Kids Cotton T-Shirt',
                description: 'Soft and skin-friendly 100% organic cotton t-shirt for kids. AZO-free dyes. Cartoon printing available.',
                category: categories[3]._id,
                priceRange: { min: 90, max: 180 },
                moq: 200,
                fabricType: 'Organic Cotton - 160 GSM',
                colors: ['White', 'Pink', 'Sky Blue', 'Yellow', 'Green'],
                sizes: ['2Y', '4Y', '6Y', '8Y', '10Y', '12Y'],
                images: ['/images/kids.png'],
                isFeatured: false
            },
            {
                title: 'Custom Printed Oversized Tee',
                description: 'Oversized drop-shoulder t-shirt with DTF/screen printing. Perfect for streetwear brands with custom artwork.',
                category: categories[4]._id,
                priceRange: { min: 200, max: 400 },
                moq: 50,
                fabricType: '100% Cotton - 240 GSM',
                colors: ['White', 'Black', 'Cream', 'Dusty Pink'],
                sizes: ['S', 'M', 'L', 'XL'],
                images: ['/images/oversized.png'],
                isFeatured: true
            }
        ]);
        console.log(`✅ ${products.length} sample products created.`);

        console.log('\n🎉 Database seeded successfully!');
        console.log('═══════════════════════════════════════');
        console.log('  Admin Login Credentials:');
        console.log('  Email:    admin@gjtex.com');
        console.log('  Password: admin123');
        console.log('═══════════════════════════════════════\n');

        process.exit(0);
    } catch (error) {
        console.error(`Error seeding database: ${error.message}`);
        process.exit(1);
    }
};

seedDB();
