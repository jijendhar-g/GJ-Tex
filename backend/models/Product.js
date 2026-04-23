import mongoose from 'mongoose';

const productSchema = mongoose.Schema({
    title: {
        type: String,
        required: true,
    },
    description: {
        type: String,
        required: true,
    },
    category: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Category',
        required: true,
    },
    priceRange: {
        min: { type: Number, required: true },
        max: { type: Number, required: true }
    },

    fabricType: {
        type: String,
        required: true,
    },
    gender: {
        type: String,
        enum: ['Men', 'Women', 'Unisex'],
        default: 'Unisex',
        required: true,
    },
    availableQuantity: {
        type: Number,
        default: 9999,
        min: 0,
        required: true,
    },
    colors: [String],
    sizes: [String],
    images: [{
        type: String,
        required: true
    }],
    isFeatured: {
        type: Boolean,
        default: false
    }
}, {
    timestamps: true,
});

const Product = mongoose.model('Product', productSchema);

export default Product;
