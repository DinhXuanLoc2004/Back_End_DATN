const express = require('express')
const { asyncHandler } = require('../utils')
const OrderController = require('../controller/order.controller')
const router = express.Router()

router.post('/create_order', asyncHandler(OrderController.createOrder))
router.get('/find_order_id_by_paypal_id', asyncHandler(OrderController.findOrderIdByPaypalId))
router.get('/get_orders_for_user', asyncHandler(OrderController.getOrdersForUser))
router.get('/get_all_orders', asyncHandler(OrderController.getAllOrder))
router.get('/get_order_detail', asyncHandler(OrderController.getOrderDetail))
router.put('/update_status_order', asyncHandler(OrderController.updateStatusOrder))
router.put('/continue_order', asyncHandler(OrderController.continueOrder))
router.get('/find_orderid_by_paypalid', asyncHandler(OrderController.findOrderIdByPaypalId))
router.get('/find_orderid_by_zptranstoken', asyncHandler(OrderController.findOrderIdByZpTransToken))
router.get('/get_products_continue_order', asyncHandler(OrderController.getProductsContinueOrder))
router.post('/cancel_order', asyncHandler(OrderController.cancelOrder))
router.get('/get_reviews_for_order', asyncHandler(OrderController.getReviewForOrder))

module.exports = router