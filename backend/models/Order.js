import mongoose from 'mongoose';

const orderSchema = mongoose.Schema({
    user: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        required: true,
    },
    orderItems: [
        {
            product: {
                type: mongoose.Schema.Types.ObjectId,
                ref: 'Product',
                required: true,
            },
            quantity: {
                type: Number,
                required: true,
            },
            price: {
                type: Number,
                required: true,
            }
        }
    ],
    totalPrice: {
        type: Number,
        required: true,
        default: 0.0
    },
    customizationDetails: {
        type: String,
    },
    logoUrl: {
        type: String,
    },
    status: {
        type: String,
        enum: ['Ordered', 'Under Process', 'Shipped', 'Delivered', 'Cancelled'],
        default: 'Ordered',
    },
    paymentMethod: {
        type: String,
        enum: ['Cash on Delivery', 'Online Payment', 'UPI / QR Code'],
        required: true,
        default: 'Cash on Delivery'
    },
    paymentStatus: {
        type: String,
        enum: ['Pending', 'Completed', 'Failed'],
        default: 'Pending'
    },
    contactDetails: {
        name: { type: String, required: true },
        companyName: { type: String },
        email: { type: String, required: true },
        phone: { type: String, required: true }
    },
    trackingHistory: [
        {
            status: { type: String },
            note: { type: String, default: '' },
            updatedAt: { type: Date, default: Date.now }
        }
    ]
}, {
    timestamps: true,
});

const Order = mongoose.model('Order', orderSchema);

export default Order;
