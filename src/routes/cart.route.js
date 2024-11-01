const express = require('express');
const { asyncHandler } = require('../utils');
const CartController = require('../controller/cart.controller');
const router = express.Router();

router.post('/add_to_cart', asyncHandler(CartController.addToCart));
router.get('/get_all_cart',asyncHandler(CartController.getAllCart));
router.put('/change_quantity_cart', asyncHandler(CartController.changeQuantityCart))
router.delete('/delete_cart', asyncHandler(CartController.deleteCart))
router.get('/get_length_cart', asyncHandler(CartController.getLengthCart))
router.get('/get_cart_checks', asyncHandler(CartController.getCartChecks))

module.exports = router