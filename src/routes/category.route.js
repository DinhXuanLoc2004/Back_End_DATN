const express = require('express')
const { asyncHandler } = require('../utils')
const CategoryController = require('../controller/category.controller')
const router = express.Router()

router.post('/add_category', asyncHandler(CategoryController.addCategory))

module.exports = router