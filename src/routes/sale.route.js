const express = require('express')
const { asyncHandler } = require('../utils')
const SaleController = require('../controller/sale.controller')
const { upload, uploadSingleImageMiddleware } = require('../middlewares/uploadfile.middleware')
const router = express.Router()

router.post('/add_sale', upload.single('image'), uploadSingleImageMiddleware, asyncHandler(SaleController.addSale))
router.get('/get_sales_active', asyncHandler(SaleController.getSalesActive))
router.put('/change_is_active_sale', asyncHandler(SaleController.changeIsActiveSale))
router.delete('/delete_sale', asyncHandler(SaleController.deteleSale))
router.put('/update_sale', upload.single('image'), uploadSingleImageMiddleware, asyncHandler(SaleController.updateSale))
router.get('/get_detail_sale', asyncHandler(SaleController.getDetailSale))

module.exports = router