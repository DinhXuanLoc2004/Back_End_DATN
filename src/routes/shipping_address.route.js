const express = require('express')
const { asyncHandler } = require('../utils')
const ShippingAddressController = require('../controller/shipping_address.controller')
const route = express.Router()

route.post('/add_shipping_address', asyncHandler(ShippingAddressController.addShippingAddress))
route.get('/get_all_shipping_address', asyncHandler(ShippingAddressController.getAllShippingAddress))
route.get('/get_detail_shipping_address', asyncHandler(ShippingAddressController.getDetailShippingAddress))
route.get('/get_default_shipping_address', asyncHandler(ShippingAddressController.getShippingAddressDefault))
route.put('/update_default_shipping_address', asyncHandler(ShippingAddressController.updateStatusDefaultAddress))
route.put('/update_shipping_address', asyncHandler(ShippingAddressController.updateShippingAddress))
route.delete('/delete_shipping_address', asyncHandler(ShippingAddressController.deleteShippingAddress))
route.get('/get_all_province', asyncHandler(ShippingAddressController.get_all_province))
route.get('/get_districts', asyncHandler(ShippingAddressController.get_districts))
route.get('/get_wards', asyncHandler(ShippingAddressController.get_warts))
route.get('/get_delivery_fee', asyncHandler(ShippingAddressController.get_delivery_fee))

module.exports = route