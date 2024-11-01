const express = require('express')
const { asyncHandler } = require('../utils')
const DeliveryMethodController = require('../controller/delivery_method.controller')
const router = express.Router()

router.post('/add_delivery_method', asyncHandler(DeliveryMethodController.addDeliveryMethod))
router.get('/get_all_delivery_method', asyncHandler(DeliveryMethodController.getAllDeliveryMethod))
router.get('/get_detail_delivery_method', asyncHandler(DeliveryMethodController.getDetailDeliveryMethod))

module.exports = router