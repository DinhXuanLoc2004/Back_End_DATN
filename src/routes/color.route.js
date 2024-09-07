const express = require('express')
const { asyncHandler } = require('../utils')
const ColorController = require('../controller/color.controller')
const router = express.Router()

router.post('/add_color', asyncHandler(ColorController.addColor))

module.exports = router