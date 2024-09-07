const express = require('express')
const { upload, uploadImageMiddleware, } = require('../middlewares/uploadfile.middleware')
const { asyncHandler } = require('../utils')
const ProductController = require('../controller/product.controller')
const router = express.Router()

router.post('/add_product', upload.array(['images']), uploadImageMiddleware, asyncHandler(ProductController.addProduct))
router.get('/get_products', asyncHandler(ProductController.getProducts))
router.get('/get_all_products', asyncHandler(ProductController.getAllProducts))

module.exports = router