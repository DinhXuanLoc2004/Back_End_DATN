const express = require('express')
const { asyncHandler } = require('../utils')
const ColorController = require('../controller/color.controller')
const router = express.Router()

router.post('/add_color', asyncHandler(ColorController.addColor))
router.get('/get_all_colors', asyncHandler(ColorController.getAllColor))
router.get('/get_delete_color', asyncHandler(ColorController.getDetailColor))
router.post('/detele_color', asyncHandler(ColorController.deleteColor))
router.post('/update_color', asyncHandler(ColorController.updateColor))

module.exports = router