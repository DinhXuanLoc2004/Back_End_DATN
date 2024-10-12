const express = require('express');
const { asyncHandler } = require('../utils');
const CartController = require('../controller/cart.controller');
const router = express.Router();

router.post('/add_to_cart', asyncHandler(CartController.addToCart));
router.get('/get_all_cart',asyncHandler(CartController.getAllCart));
router.put('/change_quantity_cart', asyncHandler(CartController.changeQuantityCart))
router.delete('/delete_cart', asyncHandler(CartController.deleteCart))

module.exports = router