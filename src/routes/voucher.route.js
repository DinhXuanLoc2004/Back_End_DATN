const express = require('express')
const { upload, uploadSingleImageMiddleware } = require('../middlewares/uploadfile.middleware')
const { asyncHandler } = require('../utils')
const VoucherController = require('../controller/voucher.controller')
const router = express.Router()

router.post('/create_voucher', upload.single('image'), uploadSingleImageMiddleware, asyncHandler(VoucherController.createVoucher))
router.get('/get_all_vouchers', asyncHandler(VoucherController.getAllVouchers))
router.get('/get_detail_voucher', asyncHandler(VoucherController.getDetailVoucher))

module.exports = router