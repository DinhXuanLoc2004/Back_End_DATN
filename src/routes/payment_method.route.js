const express = require('express')
const { asyncHandler } = require('../utils')
const PaymentMethodController = require('../controller/payment_method.controller')
const router = express.Router()

router.post('/payment_zalo_pay', asyncHandler(PaymentMethodController.paymentZaloPay))
router.post('/call_back_zalo_pay', asyncHandler(PaymentMethodController.callbackZaloPay))
router.get('/return_url_paypal', asyncHandler(PaymentMethodController.returnURLPaypal))

module.exports = router