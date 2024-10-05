const express = require('express')
const { upload, uploadImageMiddleware } = require('../middlewares/uploadfile.middleware')
const { asyncHandler } = require('../utils')
const VoucherController = require('../controller/voucher.controller')
const router = express.Router()

router.post('create_voucher', upload.single(['image']), uploadImageMiddleware, asyncHandler(VoucherController.createVoucher))
router.get('get_all_voucher', asyncHandler(VoucherController.getAllVouchers))
router.get('get_product_with_voucher', asyncHandler(VoucherController.getProductsWithVoucher))

module.exporst = router