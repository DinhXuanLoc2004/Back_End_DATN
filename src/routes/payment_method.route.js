const express = require('express')
const { asyncHandler } = require('../utils')
const PaymentMethodController = require('../controller/payment_method.controller')
const { upload, uploadSingleImageMiddleware } = require('../middlewares/uploadfile.middleware')
const router = express.Router()

router.post('/add_payment_method', upload.single('image'), uploadSingleImageMiddleware, asyncHandler(PaymentMethodController.addPaymentMethod))

module.exports = router