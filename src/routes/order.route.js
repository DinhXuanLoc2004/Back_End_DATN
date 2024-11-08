const express = require('express')
const { asyncHandler } = require('../utils')
const OrderController = require('../controller/order.controller')
const router = express.Router()

router.post('/create_order', asyncHandler(OrderController.createOrder));
router.get('/get_all_orders', asyncHandler(OrderController.getAllOrders));
router.get('/get_order_byID', asyncHandler(OrderController.getOrderById));
module.exports = router