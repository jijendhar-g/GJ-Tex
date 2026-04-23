import express from 'express';
import { protect } from '../middleware/auth.middleware.js';
import {
    createRazorpayOrder, verifyRazorpayPayment, getRazorpayKey,
    upiInitiate, upiStatus, upiWebhook
} from '../controllers/payment.controller.js';

const router = express.Router();

// Razorpay
router.post('/create-order', protect, createRazorpayOrder);
router.post('/verify', protect, verifyRazorpayPayment);
router.get('/key', protect, getRazorpayKey);

// UPI Gateway (merchant.upigateway.com)
router.post('/upi-initiate', protect, upiInitiate);
router.post('/upi-status', protect, upiStatus);

// Webhook — public endpoint (no auth), called by UPI Gateway servers
router.post('/upi-webhook', upiWebhook);

export default router;
