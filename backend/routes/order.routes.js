import express from 'express';
import {
    addOrderItems,
    getOrderById,
    updateOrderStatus,
    getMyOrders,
    getOrders,
} from '../controllers/order.controller.js';
import { protect, admin } from '../middleware/auth.middleware.js';
import { upload } from '../controllers/product.controller.js';

const router = express.Router();

router.route('/')
    .post(protect, upload.single('logoFile'), addOrderItems)
    .get(protect, admin, getOrders);

router.route('/myorders').get(protect, getMyOrders);

router.route('/:id').get(protect, getOrderById);

router.route('/:id/status').put(protect, admin, updateOrderStatus);

export default router;
