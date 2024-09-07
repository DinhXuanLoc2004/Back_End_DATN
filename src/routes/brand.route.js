const express = require('express')
const { asyncHandler } = require('../utils')
const BrandController = require('../controller/brand.controller')
const router = express.Router()

router.post('/add_brand', asyncHandler(BrandController.addBrand))

module.exports = router