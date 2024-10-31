const express = require('express')
const { asyncHandler } = require('../utils')
const SizeController = require('../controller/size.controller')
const router = express.Router()

router.post('/add_size', asyncHandler(SizeController.addSize))
router.put('/update_size/', asyncHandler(SizeController.updateSize))
router.delete('/delete_size/', asyncHandler(SizeController.deleteSize))
router.get('/get_all_sizes', asyncHandler(SizeController.getAllSizes));


module.exports = router