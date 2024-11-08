const express = require('express')
const { asyncHandler } = require('../utils')
const OrderController = require('../controller/order.controller')
const router = express.Router()

router.post('/create_order', asyncHandler(OrderController.createOrder))
router.get('/find_order_id_by_paypal_id', asyncHandler(OrderController.findOrderIdByPaypalId))
router.get('/get_orders_for_user', asyncHandler(OrderController.getOrdersForUser))

module.exports = router