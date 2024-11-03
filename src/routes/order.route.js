const express = require('express')
const { asyncHandler } = require('../utils')
const OrderController = require('../controller/order.controller')
const router = express.Router()

router.post('/create_order', asyncHandler(OrderController.createOrder))

module.exports = router