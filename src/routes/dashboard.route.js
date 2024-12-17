const express = require('express')
const { asyncHandler } = require('../utils')
const DashboardController = require('../controller/dashboard.controller')
const router = express.Router()

router.get('/order_statistics', asyncHandler(DashboardController.getOrderStatistics));


module.exports = router