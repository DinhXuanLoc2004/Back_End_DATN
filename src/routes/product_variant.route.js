const express = require('express')
const { asyncHandler } = require('../utils')
const ProductVariantController = require('../controller/product_variant.controller')
const router = express.Router()

router.get('/find_product_variant', asyncHandler(ProductVariantController.fintProductVariant))

module.exports = router