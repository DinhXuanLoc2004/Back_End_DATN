const express = require('express')
const { asyncHandler } = require('../utils')
const SizeController = require('../controller/size.controller')
const router = express.Router()

router.post('/add_size', asyncHandler(SizeController.addSize))
router.get('/get_all_sizes', asyncHandler(SizeController.getAllSize))
router.get('/get_detail_size', asyncHandler(SizeController.getDetailSize))
router.post('/delete_size', asyncHandler(SizeController.deleteSize))
router.post('/update_size', asyncHandler(SizeController.updateSize))

module.exports = router