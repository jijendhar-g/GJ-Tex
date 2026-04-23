import Product from '../models/Product.js';
import Category from '../models/Category.js';
import mongoose from 'mongoose';
import multer from 'multer';
import path from 'path';

// Setup multer for image upload
const storage = multer.diskStorage({
    destination(req, file, cb) {
        cb(null, 'uploads/');
    },
    filename(req, file, cb) {
        cb(null, `${file.fieldname}-${Date.now()}${path.extname(file.originalname)}`);
    },
});

function checkFileType(file, cb) {
    const filetypes = /jpg|jpeg|png|webp/;
    const extname = filetypes.test(path.extname(file.originalname).toLowerCase());
    const mimetype = filetypes.test(file.mimetype);

    if (extname && mimetype) {
        return cb(null, true);
    } else {
        cb('Images only!');
    }
}

export const upload = multer({
    storage,
    fileFilter: function (req, file, cb) {
        checkFileType(file, cb);
    },
});


// @desc    Get all products (with pagination & search)
// @route   GET /api/products
// @access  Public
export const getProducts = async (req, res) => {
    try {
        const pageSize = 10;
        const page = Number(req.query.pageNumber) || 1;

        const keyword = req.query.keyword
            ? {
                title: {
                    $regex: req.query.keyword,
                    $options: 'i',
                },
            }
            : {};

        // Handle category filter - support both ObjectId and category name
        let categoryFilter = {};
        if (req.query.category) {
            if (mongoose.Types.ObjectId.isValid(req.query.category)) {
                categoryFilter = { category: req.query.category };
            } else {
                // Look up category by name (case-insensitive)
                const cat = await Category.findOne({ name: { $regex: new RegExp(`^${req.query.category}$`, 'i') } });
                if (cat) {
                    categoryFilter = { category: cat._id };
                } else {
                    // No matching category found, return empty results
                    return res.json({ products: [], page: 1, pages: 0, count: 0 });
                }
            }
        }

        // Handle gender filter
        let genderFilter = {};
        if (req.query.gender && req.query.gender !== 'All') {
            genderFilter = { gender: req.query.gender };
        }

        const count = await Product.countDocuments({ ...keyword, ...categoryFilter, ...genderFilter });
        const products = await Product.find({ ...keyword, ...categoryFilter, ...genderFilter })
            .populate('category', 'name')
            .limit(pageSize)
            .skip(pageSize * (page - 1));

        res.json({ products, page, pages: Math.ceil(count / pageSize), count });
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

// @desc    Get single product
// @route   GET /api/products/:id
// @access  Public
export const getProductById = async (req, res) => {
    try {
        const product = await Product.findById(req.params.id).populate('category', 'name');

        if (product) {
            res.json(product);
        } else {
            res.status(404).json({ message: 'Product not found' });
        }
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

// @desc    Create a product
// @route   POST /api/products
// @access  Private/Admin
export const createProduct = async (req, res) => {
    try {
        const { title, description, category, priceRange, moq, fabricType, colors, sizes, isFeatured, images: bodyImages, gender, availableQuantity } = req.body;
        let images = [];
        if (req.files && req.files.length > 0) {
            images = req.files.map(file => `/uploads/${file.filename}`);
        } else if (bodyImages && Array.isArray(bodyImages)) {
            images = bodyImages;
        }

        const product = new Product({
            title,
            description,
            category,
            priceRange: typeof priceRange === 'string' ? JSON.parse(priceRange) : priceRange,
            moq,
            fabricType,
            gender: gender || 'Unisex',
            availableQuantity: Number(availableQuantity) || 0,
            colors: typeof colors === 'string' ? JSON.parse(colors) : colors,
            sizes: typeof sizes === 'string' ? JSON.parse(sizes) : sizes,
            images,
            isFeatured
        });

        const createdProduct = await product.save();
        res.status(201).json(createdProduct);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

// @desc    Update a product
// @route   PUT /api/products/:id
// @access  Private/Admin
export const updateProduct = async (req, res) => {
    try {
        const { title, description, category, priceRange, moq, fabricType, colors, sizes, isFeatured, images: bodyImages, gender, availableQuantity } = req.body;

        const product = await Product.findById(req.params.id);

        if (product) {
            product.title = title || product.title;
            product.description = description || product.description;
            product.category = category || product.category;
            if (priceRange) product.priceRange = typeof priceRange === 'string' ? JSON.parse(priceRange) : priceRange;
            if (moq) product.moq = moq;
            if (fabricType) product.fabricType = fabricType;
            if (gender) product.gender = gender;
            if (availableQuantity !== undefined) product.availableQuantity = Number(availableQuantity);
            if (colors) product.colors = typeof colors === 'string' ? JSON.parse(colors) : colors;
            if (sizes) product.sizes = typeof sizes === 'string' ? JSON.parse(sizes) : sizes;
            if (isFeatured !== undefined) product.isFeatured = isFeatured;

            if (req.files && req.files.length > 0) {
                product.images = req.files.map(file => `/uploads/${file.filename}`);
            } else if (bodyImages && Array.isArray(bodyImages) && bodyImages.length > 0) {
                product.images = bodyImages;
            }

            const updatedProduct = await product.save();
            res.json(updatedProduct);
        } else {
            res.status(404).json({ message: 'Product not found' });
        }
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

// @desc    Delete a product
// @route   DELETE /api/products/:id
// @access  Private/Admin
export const deleteProduct = async (req, res) => {
    try {
        const product = await Product.findById(req.params.id);

        if (product) {
            await Product.deleteOne({ _id: product._id });
            res.json({ message: 'Product removed' });
        } else {
            res.status(404).json({ message: 'Product not found' });
        }
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};
