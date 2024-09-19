const express = require('express')
const { asyncHandler } = require('../utils')
const BrandController = require('../controller/brand.controller')
const { upload, uploadSingleImageMiddleware } = require('../middlewares/uploadfile.middleware')
const router = express.Router()

router.post('/add_brand', upload.single(['image']), uploadSingleImageMiddleware, asyncHandler(BrandController.addBrand))

module.exports = router