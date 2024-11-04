const express = require('express')
const { asyncHandler } = require('../utils')
const PaymentMethodController = require('../controller/payment_method.controller')
const { upload, uploadSingleImageMiddleware } = require('../middlewares/uploadfile.middleware')
const PaymentMethodService = require('../services/payment_method.service')
const router = express.Router()

router.post('/add_payment_method', upload.single('image'), uploadSingleImageMiddleware, asyncHandler(PaymentMethodController.addPaymentMethod))
router.post('/test_payment_momo', asyncHandler(PaymentMethodController.paymentMomo))
router.post('/payment_zalo_pay', asyncHandler(PaymentMethodController.paymentZaloPay))
router.post('/call_back_zalo_pay', asyncHandler(PaymentMethodController.callbackZaloPay))
router.get('/get_all_payment', asyncHandler(PaymentMethodController.getAllPaymentPathod))

module.exports = router