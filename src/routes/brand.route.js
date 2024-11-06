const express = require('express')
const { asyncHandler } = require('../utils')
const BrandController = require('../controller/brand.controller')
const { upload, uploadSingleImageMiddleware } = require('../middlewares/uploadfile.middleware')
const router = express.Router()

router.post('/add_brand', upload.single(['image']), uploadSingleImageMiddleware, asyncHandler(BrandController.addBrand))
router.delete('/delete_brand', asyncHandler(BrandController.deleteBrand));
router.get('/get_brands', asyncHandler(BrandController.getBrands));
router.put('/update_brand', asyncHandler(BrandController.updateBrand));

module.exports = router