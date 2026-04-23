import Razorpay from 'razorpay';
import crypto from 'crypto';
import Order from '../models/Order.js';

// @desc    Create Razorpay order
// @route   POST /api/payment/create-order
// @access  Private
export const createRazorpayOrder = async (req, res) => {
    try {
        const { amount } = req.body; // Amount should be in INR

        if (!amount) {
            return res.status(400).json({ message: 'Amount is required' });
        }

        const instance = new Razorpay({
            key_id: process.env.RAZORPAY_KEY_ID,
            key_secret: process.env.RAZORPAY_KEY_SECRET,
        });

        const options = {
            amount: Math.round(amount * 100), // convert to paise
            currency: 'INR',
            receipt: `receipt_${Date.now()}`
        };

        const order = await instance.orders.create(options);

        if (!order) return res.status(500).send('Some error occurred');

        res.json(order);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

// @desc    Verify Razorpay payment
// @route   POST /api/payment/verify
// @access  Private
export const verifyRazorpayPayment = async (req, res) => {
    try {
        const {
            razorpay_order_id,
            razorpay_payment_id,
            razorpay_signature
        } = req.body;

        const body = razorpay_order_id + "|" + razorpay_payment_id;

        const expectedSignature = crypto
            .createHmac('sha256', process.env.RAZORPAY_KEY_SECRET)
            .update(body.toString())
            .digest('hex');

        const isAuthentic = expectedSignature === razorpay_signature;

        if (isAuthentic) {
            // Payment is verified
            res.json({ message: 'Payment successfully verified', success: true });
        } else {
            res.status(400).json({ message: 'Invalid Signature', success: false });
        }
    } catch (error) {
        res.status(500).json({ message: error.message, success: false });
    }
};

// @desc    Get Razorpay Key ID
// @route   GET /api/payment/key
// @access  Private
export const getRazorpayKey = (req, res) => {
    res.json({ key: process.env.RAZORPAY_KEY_ID });
};

// ─────────────────────────────────────────────────────────────────────────────
//  UPI GATEWAY (merchant.upigateway.com) — Real Payment Integration
// ─────────────────────────────────────────────────────────────────────────────

const UPI_GATEWAY_BASE = 'https://merchant.upigateway.com/api';

/**
 * @desc    Create a UPI payment order via UPI Gateway
 * @route   POST /api/payment/upi-initiate
 * @access  Private
 */
export const upiInitiate = async (req, res) => {
    try {
        const { amount, customerName, customerEmail, customerMobile, productInfo } = req.body;

        if (!amount) {
            return res.status(400).json({ message: 'Amount is required' });
        }

        // Generate a unique client transaction ID
        const clientTxnId = `GJTEX_${Date.now()}_${Math.random().toString(36).slice(2, 8)}`;

        const payload = {
            key: process.env.UPI_GATEWAY_KEY || 'b71846ce-1b65-40f2-b81e-ece9c4124d67',
            client_txn_id: clientTxnId,
            amount: String(parseFloat(amount).toFixed(2)),
            p_info: productInfo || 'GJ TEX Order',
            customer_name: customerName || req.user.name || 'Customer',
            customer_email: customerEmail || req.user.email || 'customer@example.com',
            customer_mobile: customerMobile || '9999999999',
            redirect_url: 'https://gjtex-payment-callback.vercel.app/checkout',
            udf1: req.user._id.toString(),
            udf2: '',
            udf3: ''
        };

        console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
        console.log('🔄 UPI Gateway - Creating Order');
        console.log('  Endpoint:', `${UPI_GATEWAY_BASE}/create_order`);
        console.log('  Payload:', JSON.stringify(payload, null, 2));
        console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');

        const response = await fetch(`${UPI_GATEWAY_BASE}/create_order`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(payload)
        });

        const data = await response.json();

        console.log('📥 UPI Gateway Parsed Response:', JSON.stringify(data, null, 2));

        if (data.status === true) {
            res.json({
                success: true,
                message: data.msg,
                orderId: data.data?.order_id,
                paymentUrl: data.data?.payment_url,
                upiIntent: data.data?.upi_intent || null,
                clientTxnId
            });
        } else {
            console.error('❌ UPI Gateway rejected order:', data.msg);
            res.status(400).json({
                success: false,
                message: `UPI Gateway Error: ${JSON.stringify(data)}`
            });
        }
    } catch (error) {
        console.error('❌ UPI Gateway create_order exception:', error);
        res.status(500).json({ message: `Exception: ${error.message}` });
    }
};

/**
 * @desc    Check UPI payment status via UPI Gateway
 * @route   POST /api/payment/upi-status
 * @access  Private
 */
export const upiStatus = async (req, res) => {
    try {
        const { clientTxnId } = req.body;

        if (!clientTxnId) {
            return res.status(400).json({ message: 'clientTxnId is required' });
        }

        // Check webhook cache first (instant confirmation if webhook already arrived)
        const cached = webhookStatusCache.get(clientTxnId);
        if (cached && (cached.status === 'SUCCESS' || cached.status === 'FAILED')) {
            return res.json({
                success: true,
                status: cached.status,
                rawData: cached,
                utrNumber: cached.utr || null
            });
        }

        const payload = {
            key: process.env.UPI_GATEWAY_KEY || 'b71846ce-1b65-40f2-b81e-ece9c4124d67',
            client_txn_id: clientTxnId
        };

        const response = await fetch(`${UPI_GATEWAY_BASE}/check_order_status`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(payload)
        });

        const data = await response.json();

        // UPI Gateway returns status values like:
        //   "success" — payment successful
        //   "failure" — payment failed
        //   "pending" — payment still pending
        //   "scanning" — user scanning QR
        let normalizedStatus = 'PENDING';
        const rawStatus = (data.data?.status || data.status || '').toString().toLowerCase();

        if (rawStatus === 'success' || rawStatus === 'true') {
            normalizedStatus = 'SUCCESS';
        } else if (rawStatus === 'failure' || rawStatus === 'failed') {
            normalizedStatus = 'FAILED';
        } else if (rawStatus === 'scanning') {
            normalizedStatus = 'SCANNING';
        }

        res.json({
            success: true,
            status: normalizedStatus,
            rawData: data.data || data,
            utrNumber: data.data?.utr || data.data?.txnId || null
        });
    } catch (error) {
        console.error('UPI Gateway check_status error:', error);
        res.status(500).json({ message: error.message });
    }
};

// ─────────────────────────────────────────────────────────────────────────────
//  WEBHOOK — UPI Gateway sends payment notifications here (public endpoint)
// ─────────────────────────────────────────────────────────────────────────────

// In-memory cache so polling can instantly pick up webhook-confirmed status
export const webhookStatusCache = new Map();

/**
 * @desc    Webhook endpoint for UPI Gateway payment notifications
 * @route   POST /api/payment/upi-webhook
 * @access  Public (called by UPI Gateway servers, no auth)
 */
export const upiWebhook = (req, res) => {
    try {
        const payload = req.body;

        console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
        console.log('📩 UPI Gateway Webhook Received');
        console.log('  client_txn_id :', payload.client_txn_id);
        console.log('  amount        :', payload.amount);
        console.log('  status        :', payload.status);
        console.log('  utr           :', payload.utr || 'N/A');
        console.log('  Full payload  :', JSON.stringify(payload, null, 2));
        console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');

        const txnId = payload.client_txn_id;
        const rawStatus = (payload.status || '').toString().toLowerCase();

        if (txnId) {
            let normalizedStatus = 'PENDING';
            if (rawStatus === 'success') normalizedStatus = 'SUCCESS';
            else if (rawStatus === 'failure' || rawStatus === 'failed') normalizedStatus = 'FAILED';

            // Cache for 30 minutes
            webhookStatusCache.set(txnId, {
                status: normalizedStatus,
                utr: payload.utr || null,
                amount: payload.amount,
                receivedAt: new Date()
            });
            setTimeout(() => webhookStatusCache.delete(txnId), 30 * 60 * 1000);
        }

        // Always respond 200 so UPI Gateway doesn't retry
        res.status(200).json({ status: true, message: 'Webhook received' });
    } catch (error) {
        console.error('Webhook processing error:', error);
        res.status(200).json({ status: true, message: 'Webhook received with error' });
    }
};
