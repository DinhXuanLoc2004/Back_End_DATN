const { NotFoundError } = require("../core/error.reponse");
const { userModel } = require("../models/user.model");
const { cartModel } = require('../models/cart.model')

class CartService {
    static addToCart = async ({ body }) => {
        const { product_id, size_id, color_id, quantity, user_id } = body;
        const user = await userModel.findById(user_id).lean();
        if (!user) throw new NotFoundError('Not found user!');
        const productInCart = await cartModel.findOne({ product_id, size_id, color_id, user_id }).lean();
        if (productInCart) {
            return await cartModel.findOneAndUpdate({
                product_id, size_id, color_id, user_id
            }, {
                $set: { quantity: productInCart.quantity + quantity }
            }, {
                new: true
            });
        }
        return await cartModel.create({ product_id, size_id, color_id, quantity, user_id });
    }
}

module.exports = CartService