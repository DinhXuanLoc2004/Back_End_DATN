const express = require('express')
const { asyncHandler } = require('../utils')
const SaleController = require('../controller/sale.controller')
const router = express.Router()

router.post('/add_sale', asyncHandler(SaleController.addSale))

module.exports = router