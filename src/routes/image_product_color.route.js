const express = require('express')
const { upload, uploadSingleImageMiddleware } = require('../middlewares/uploadfile.middleware')
const ImageProductColorController = require('../controller/image_product_color.contorller')
const router = express.Router()

router.post('/add_image_product_color', upload.single(['image']), uploadSingleImageMiddleware, ImageProductColorController.addImageProductColor)

module.exports = router