const express = require('express')
const { upload, uploadImageMiddleware } = require('../middlewares/uploadfile.middleware')
const { asyncHandler } = require('../utils')
const ReviewController = require('../controller/review.controller')
const router = express.Router()

router.post('/add_review', upload.array(['images']), uploadImageMiddleware, asyncHandler(ReviewController.addReview))

module.exports = router