const express = require('express')
const { upload, uploadImageMiddleware, } = require('../middlewares/uploadfile.middleware')
const { asyncHandler } = require('../utils')
const ProductController = require('../controller/product.controller')
const router = express.Router()

router.post('/add_product', upload.array(['images']), uploadImageMiddleware, asyncHandler(ProductController.addProduct))
router.get('/get_products', asyncHandler(ProductController.getProducts))
router.post('/get_all_products/', asyncHandler(ProductController.getAllProducts))
router.get('/get_data_filter', asyncHandler(ProductController.getDataFilter))
router.get('/get_detail_product', asyncHandler(ProductController.getProductDetail))
router.get('/get_colors_sizes_to_product', asyncHandler(ProductController.getColorSizeToProduct))
router.get('/get_product_detail_update', asyncHandler(ProductController.getDetailProductUpdate))
router.post('/update_product', upload.array(['images']), uploadImageMiddleware, asyncHandler(ProductController.updateProduct))
router.delete('/toggle_delete_product', asyncHandler(ProductController.toggleDeleteProduct))
router.put('/toggle_public_product', asyncHandler(ProductController.togglePublicProduct))

module.exports = router