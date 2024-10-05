const express = require('express');
const { asyncHandler } = require('../utils');
const CartController = require('../controller/cart.controller');
const router = express.Router();

router.post('/addToCart', asyncHandler(CartController.addToCart));

module.exports = router