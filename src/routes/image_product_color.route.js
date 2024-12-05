const express = require('express')
const { upload, uploadSingleImageMiddleware } = require('../middlewares/uploadfile.middleware')
const ImageProductColorController = require('../controller/image_product_color.contorller')
const { asyncHandler } = require('../utils')
const router = express.Router()

router.post('/add_image_product_color', upload.single('image'), uploadSingleImageMiddleware,
    asyncHandler(ImageProductColorController.addImageProductColor))

router.put('/update_image_product_color', upload.single('image'), uploadSingleImageMiddleware,
    asyncHandler(ImageProductColorController.updateImageProductColor))

module.exports = router