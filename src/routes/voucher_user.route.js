const express = require('express')
const { asyncHandler } = require('../utils')
const VoucherUserController = require('../controller/voucher_user.controller')
const router = express.Router()

router.post('/save_voucher_user', asyncHandler(VoucherUserController.saveVoucher))
router.get('/get_voucher_user', asyncHandler(VoucherUserController.getValidVoucher))

module.exports = router