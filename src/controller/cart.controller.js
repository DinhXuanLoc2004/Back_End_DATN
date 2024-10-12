const { CREATED, OK } = require("../core/success.response")
const CartService = require('../services/cart.service')

class CartController {
    static deleteCart = async (req, res, next) => {
        new OK({
            message: 'Delete item cart success!',
            metadata: await CartService.deleteCart({ query: req.query })
        }).send(res)
    }

    static changeQuantityCart = async (req, res, next) => {
        new OK({
            message: 'Update quantity item cart success!',
            metadata: await CartService.changeQuantityCart({ body: req.body })
        }).send(res)
    }

    static getAllCart = async (req, res, next) => {
        new OK({
            message: 'Get all item cart success!',
            metadata: await CartService.getAllCart({ query: req.query })
        }).send(res)
    }

    static addToCart = async (req, res, next) => {
        new CREATED({
            message: 'Add to cart success!',
            metadata: await CartService.addToCart({ body: req.body })
        }).send(res)
    }
}

module.exports = CartController