const express = require('express')
const { asyncHandler } = require('../utils')
const ColorController = require('../controller/color.controller')
const router = express.Router()

router.post('/add_color', asyncHandler(ColorController.addColor))
router.put('/update_color/', asyncHandler(ColorController.updateColor)) // Sử dụng query cho id
router.delete('/delete_color/', asyncHandler(ColorController.deleteColor)) // Sử dụng query cho id
router.post('/get_all_colors', asyncHandler(ColorController.getAllColors))

module.exports = router
