import Order from '../models/Order.js';
import Product from '../models/Product.js';
import nodemailer from 'nodemailer';

// Create reusable transporter
const createTransporter = () => {
    return nodemailer.createTransport({
        host: process.env.SMTP_HOST || 'smtp.gmail.com',
        port: parseInt(process.env.SMTP_PORT || '587'),
        secure: false,
        auth: {
            user: process.env.SMTP_USER,
            pass: process.env.SMTP_PASS,
        },
    });
};

// Status emoji mapping
const statusEmoji = {
    'Ordered': '📦',
    'Under Process': '🔄',
    'Shipped': '🚚',
    'Delivered': '✅',
    'Cancelled': '❌'
};

// Send order status email
const sendStatusEmail = async (order, newStatus) => {
    try {
        if (!process.env.SMTP_USER || !process.env.SMTP_PASS) return;
        const customerEmail = order.contactDetails?.email;
        const customerName = order.contactDetails?.name || 'Customer';
        if (!customerEmail) return;

        const transporter = createTransporter();
        const emoji = statusEmoji[newStatus] || '📋';
        const orderId = order._id.toString().slice(-8).toUpperCase();

        const html = `
        <div style="font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif; max-width: 600px; margin: 0 auto; background: #f8fafc; border-radius: 16px; overflow: hidden;">
            <div style="background: linear-gradient(135deg, #1a1a2e 0%, #16213e 100%); padding: 32px; text-align: center;">
                <h1 style="color: #fff; margin: 0; font-size: 24px;">GJ TEX</h1>
                <p style="color: rgba(255,255,255,0.6); margin: 8px 0 0; font-size: 13px;">Order Status Update</p>
            </div>
            <div style="padding: 32px;">
                <p style="color: #374151; font-size: 16px; margin: 0 0 8px;">Hi <strong>${customerName}</strong>,</p>
                <p style="color: #6b7280; font-size: 14px; line-height: 1.6; margin: 0 0 24px;">Your order status has been updated. Here are the details:</p>
                
                <div style="background: #fff; border-radius: 12px; padding: 20px; border: 1px solid #e5e7eb; margin-bottom: 24px;">
                    <table style="width: 100%; border-collapse: collapse;">
                        <tr>
                            <td style="padding: 8px 0; color: #9ca3af; font-size: 13px;">Order ID</td>
                            <td style="padding: 8px 0; text-align: right; font-weight: 700; color: #1f2937; font-size: 13px;">#${orderId}</td>
                        </tr>
                        <tr>
                            <td style="padding: 8px 0; color: #9ca3af; font-size: 13px;">Amount</td>
                            <td style="padding: 8px 0; text-align: right; font-weight: 700; color: #1f2937; font-size: 13px;">₹${order.totalPrice?.toLocaleString('en-IN')}</td>
                        </tr>
                        <tr>
                            <td style="padding: 8px 0; color: #9ca3af; font-size: 13px;">New Status</td>
                            <td style="padding: 8px 0; text-align: right; font-weight: 800; color: #f97316; font-size: 15px;">${emoji} ${newStatus}</td>
                        </tr>
                    </table>
                </div>

                <div style="background: linear-gradient(135deg, #fff7ed, #fef3c7); border-radius: 12px; padding: 16px; border: 1px solid #fed7aa; text-align: center; margin-bottom: 24px;">
                    <p style="margin: 0; font-size: 28px;">${emoji}</p>
                    <p style="margin: 8px 0 0; font-weight: 700; color: #92400e; font-size: 16px;">${newStatus}</p>
                </div>

                <p style="color: #9ca3af; font-size: 12px; text-align: center; margin: 0;">
                    If you have any questions, please reply to this email or contact us on WhatsApp.<br/>
                    <strong>GJ TEX Manufacturing</strong> — Tiruppur
                </p>
            </div>
        </div>`;

        await transporter.sendMail({
            from: `"GJ TEX" <${process.env.SMTP_EMAIL || process.env.SMTP_USER}>`,
            to: customerEmail,
            subject: `${emoji} Order #${orderId} — ${newStatus} | GJ TEX`,
            html,
        });
        console.log(`📧 Status email sent to ${customerEmail} for order #${orderId}`);
    } catch (err) {
        console.error('⚠️ Email notification failed:', err.message);
    }
};

// @desc    Create new order
// @route   POST /api/orders
// @access  Private
export const addOrderItems = async (req, res) => {
    try {
        const {
            orderItems,
            totalPrice,
            customizationDetails,
            contactDetails,
            paymentMethod
        } = req.body;

        let logoUrl = '';
        if (req.file) {
            logoUrl = `/uploads/${req.file.filename}`;
        }

        if (!orderItems || orderItems.length === 0) {
            return res.status(400).json({ message: 'No order items' });
        }

        // Handle contact details depending on whether it's JSON or FormData
        let finalContactDetails = contactDetails;

        if (typeof finalContactDetails === 'string') {
            try { finalContactDetails = JSON.parse(finalContactDetails); } catch (e) { }
        }

        if (!finalContactDetails || Object.keys(finalContactDetails).length === 0) {
            finalContactDetails = {
                name: req.body.name,
                companyName: req.body.companyName,
                email: req.body.email,
                phone: req.body.phone
            };
        }

        // Ensure totalPrice is calculated if somehow missing
        let calculatedTotal = totalPrice;
        if (!calculatedTotal) {
            calculatedTotal = orderItems.reduce((acc, item) => acc + (item.price * item.quantity), 0);
        }

        const order = new Order({
            user: req.user._id,
            orderItems,
            totalPrice: calculatedTotal,
            customizationDetails,
            logoUrl,
            contactDetails: finalContactDetails,
            paymentMethod: paymentMethod || 'Cash on Delivery',
            paymentStatus: paymentMethod === 'Online Payment' ? 'Completed' : 'Pending',
            status: 'Ordered'
        });

        const createdOrder = await order.save();

        // Deduct available quantity for each ordered product
        for (const item of orderItems) {
            const prod = await Product.findById(item.product);
            if (prod) {
                prod.availableQuantity = Math.max(0, (prod.availableQuantity || 0) - item.quantity);
                await prod.save();
            }
        }

        res.status(201).json(createdOrder);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

// @desc    Get logged in user orders
// @route   GET /api/orders/myorders
// @access  Private
export const getMyOrders = async (req, res) => {
    try {
        const orders = await Order.find({ user: req.user._id }).populate('orderItems.product', 'title images');
        res.json(orders);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

// @desc    Get order by ID
// @route   GET /api/orders/:id
// @access  Private
export const getOrderById = async (req, res) => {
    try {
        const order = await Order.findById(req.params.id)
            .populate('user', 'name email')
            .populate('orderItems.product');

        if (order) {
            // Check if admin or owner
            if (req.user.role === 'admin' || order.user._id.toString() === req.user._id.toString()) {
                res.json(order);
            } else {
                res.status(403).json({ message: 'Not authorized to view this order' });
            }
        } else {
            res.status(404).json({ message: 'Order not found' });
        }
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

// @desc    Get all orders
// @route   GET /api/orders
// @access  Private/Admin
export const getOrders = async (req, res) => {
    try {
        const orders = await Order.find({}).populate('user', 'name companyName').populate('orderItems.product', 'title');
        res.json(orders);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

// @desc    Update order status
// @route   PUT /api/orders/:id/status
// @access  Private/Admin
export const updateOrderStatus = async (req, res) => {
    try {
        const order = await Order.findById(req.params.id);

        if (order) {
            const newStatus = req.body.status || order.status;
            const note = req.body.note || '';
            order.status = newStatus;

            // Append to tracking history
            order.trackingHistory.push({
                status: newStatus,
                note,
                updatedAt: new Date()
            });

            const updatedOrder = await order.save();

            // Send email notification to customer (async, don't wait)
            sendStatusEmail(order, newStatus);

            res.json(updatedOrder);
        } else {
            res.status(404).json({ message: 'Order not found' });
        }
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

