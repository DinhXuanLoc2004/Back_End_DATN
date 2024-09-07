const express = require('express')
const { asyncHandler } = require('../utils')
const SizeController = require('../controller/size.controller')
const router = express.Router()

router.post('/add_size', asyncHandler(SizeController.addSize))

module.exports = router