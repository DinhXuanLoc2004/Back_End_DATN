const express = require('express')
const { upload, uploadSingleImageMiddleware } = require('../middlewares/uploadfile.middleware')
const { asyncHandler } = require('../utils')
const VoucherController = require('../controller/voucher.controller')
const router = express.Router()

router.post('/create_voucher', upload.single('image'), uploadSingleImageMiddleware,
    asyncHandler(VoucherController.createVoucher))
router.get('/get_all_vouchers', asyncHandler(VoucherController.getAllVouchers))
router.get('/get_detail_voucher', asyncHandler(VoucherController.getDetailVoucher))
router.put('/update_voucher', upload.single('image'), uploadSingleImageMiddleware,
    asyncHandler(VoucherController.updateVoucher))
router.get('/get_voucher_detail_update', asyncHandler(VoucherController.getDetailVoucherUpdate))
router.get('/get_all_vouchers/admin', asyncHandler(VoucherController.getAllVoucherToAdmin))
router.put('/toggle_active_voucher', asyncHandler(VoucherController.toggleActieVoucher))

module.exports = router