const express = require('express')
const router = express.Router()

const BASE_URL = '/v1/api'

router.use(`${BASE_URL}/auth`, require('./auth.route'))
router.use(`${BASE_URL}/otp`, require('./otp.route'))
router.use(`${BASE_URL}/token`, require('./token.route'))
router.use(`${BASE_URL}/product`, require('./product.route'))
router.use(`${BASE_URL}/brand`, require('./brand.route'))
router.use(`${BASE_URL}/category`, require('./category.route'))
router.use(`${BASE_URL}/color`, require('./color.route'))
router.use(`${BASE_URL}/size`, require('./size.route'))
router.use(`${BASE_URL}/sale`, require('./sale.route'))
router.use(`${BASE_URL}/review`, require('./review.route'))
router.use(`${BASE_URL}/favorite`, require('./favorite.route'))
router.use(`${BASE_URL}/cart`, require('./cart.route'))
router.use(`${BASE_URL}/image_product_color`, require('./image_product_color.route'))
router.use(`${BASE_URL}/product_variant`, require('./product_variant.route'))
router.use(`${BASE_URL}/shipping_address`, require('./shipping_address.route'))
router.use(`${BASE_URL}/voucher`, require('./voucher.route'))
router.use(`${BASE_URL}/voucher_user`, require('./voucher_user.route'))
router.use(`${BASE_URL}/payment_method`, require('./payment_method.route'))
router.use(`${BASE_URL}/delivery_method`, require('./delivery_method.route'))
router.use(`${BASE_URL}/order`, require('./order.route'))

module.exports = router