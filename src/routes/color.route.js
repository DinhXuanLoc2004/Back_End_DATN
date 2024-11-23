const express = require('express')
const { asyncHandler } = require('../utils')
const ColorController = require('../controller/color.controller')
const router = express.Router()

router.delete('/add_color', asyncHandler(ColorController.addColor))
router.delete('/get_all_colors', asyncHandler(ColorController.getAllColor))
router.delete('/get_delete_color', asyncHandler(ColorController.getDetailColor))
router.delete('/detele_color', asyncHandler(ColorController.deleteColor))
router.delete('/update_color', asyncHandler(ColorController.updateColor))

module.exports = router
