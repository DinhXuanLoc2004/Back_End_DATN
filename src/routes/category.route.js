const express = require('express')
const { asyncHandler } = require('../utils')
const CategoryController = require('../controller/category.controller')
const { upload, uploadSingleImageMiddleware,  } = require('../middlewares/uploadfile.middleware')
const router = express.Router()

router.post('/add_category', upload.single(['image']), uploadSingleImageMiddleware, asyncHandler(CategoryController.addCategory))
router.get('/get_categories/:parent_id?', asyncHandler(CategoryController.getCategories))
router.put('/update_category', asyncHandler(CategoryController.updateCategory))
router.delete('/delete_category', asyncHandler(CategoryController.deleteCategory)) 

module.exports = router