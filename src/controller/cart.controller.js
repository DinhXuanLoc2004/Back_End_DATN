const { CREATED } = require("../core/success.response")
const CartService = require('../services/cart.service')

class CartController {
    static addToCart = async (req, res, next) => {
        new CREATED({
            message: 'Add to cart success!',
            metadata: await CartService.addToCart({body: req.body})
        }).send(res)
    }
}

module.exports = CartController