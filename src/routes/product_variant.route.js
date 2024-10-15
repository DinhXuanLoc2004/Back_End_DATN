const express = require('express')
const { asyncHandler } = require('../utils')
const ProductVariantController = require('../controller/product_variant.controller')
const router = express.Router()

router.get('/find_product_variant', asyncHandler(ProductVariantController.fintProductVariant))
router.get('/find_size_product_variant', asyncHandler(ProductVariantController.findSizeProductVariant))
router.get('/find_image_color_product_variant', asyncHandler(ProductVariantController.findColorImageProductVariant))

module.exports = router