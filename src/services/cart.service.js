const { NotFoundError, ConflictRequestError } = require("../core/error.reponse");
const { userModel } = require("../models/user.model");
const { cartModel } = require('../models/cart.model');
const { selectFilesData } = require("../utils");
const { COLLECTION_NAME_PRODUCT_VARIANT } = require("../models/product_variant.model");
const { COLLECTION_NAME_SIZE } = require("../models/size.model");
const { COLLECTION_NAME_IMAGE_PRODUCT_COLOR } = require("../models/image_product_color.model");
const { COLLECTION_NAME_PRODUCT } = require("../models/product.model");
const { COLLECTION_NAME_COLOR } = require("../models/color.model");
const { COLLECTION_NAME_FAVORITE } = require("../models/favorite.model");

class CartService {
    static deleteCart = async ({ query }) => {
        const { cart_id } = query
        const cart = await cartModel.findById(cart_id).lean()
        if (!cart) throw new NotFoundError('Item cart not found!')
        const cartDelete = await cartModel.findByIdAndDelete(cart_id)
        if (!cartDelete) throw new ConflictRequestError('Error delete cart')
        return selectFilesData({ fileds: ['_id'], object: cartDelete })
    }

    static changeQuantityCart = async ({ body }) => {
        const { cart_id, value } = body
        const cart = await cartModel.findById(cart_id).lean()
        if (!cart) throw new NotFoundError('Item cart not found!')
        const cartUpdate = await cartModel.findByIdAndUpdate(cart_id, {
            quantity: cart.quantity + value
        }, { new: true })
        if (!cartUpdate) throw new ConflictRequestError('Error update quantity item cart')
        return selectFilesData({ fileds: ['_id', 'product_variant', 'quantity', 'user_id', 'product_variant_id'], object: cartUpdate })
    }

    static getAllCart = async ({ query }) => {
        const { user_id } = query
        const user = await userModel.findById(user_id).lean();
        if (!user) throw new NotFoundError('Not found user!');
        const carts = await cartModel.aggregate([
            { $match: { user_id: user._id } },
            {
                $lookup: {
                    from: COLLECTION_NAME_PRODUCT_VARIANT,
                    localField: 'product_variant_id',
                    foreignField: '_id',
                    as: 'product_variant'
                }
            }, {
                $addFields: { product_variant: { $arrayElemAt: ['$product_variant', 0] } }
            }, {
                $lookup: {
                    from: COLLECTION_NAME_SIZE,
                    localField: 'product_variant.size_id',
                    foreignField: '_id',
                    as: 'size'
                }
            }, {
                $lookup: {
                    from: COLLECTION_NAME_IMAGE_PRODUCT_COLOR,
                    localField: 'product_variant.image_product_color_id',
                    foreignField: '_id',
                    as: 'image_product_color'
                }
            }, {
                $lookup: {
                    from: COLLECTION_NAME_PRODUCT,
                    localField: 'product_variant.product_id',
                    foreignField: '_id',
                    as: 'product'
                }
            }, {
                $addFields: {
                    size: { $arrayElemAt: ['$size', 0] },
                    image_product_color: { $arrayElemAt: ['$image_product_color', 0] },
                    product: { $arrayElemAt: ['$product', 0] }
                }
            }, {
                $lookup: {
                    from: COLLECTION_NAME_COLOR,
                    localField: 'image_product_color.color_id',
                    foreignField: '_id',
                    as: 'color'
                }
            }, {
                $lookup: {
                    from: COLLECTION_NAME_FAVORITE,
                    localField: 'product._id',
                    foreignField: 'product_id',
                    as: 'favorites'
                }
            }, {
                $addFields: {
                    color: { $arrayElemAt: ['$color', 0] },
                    isFavorite: {
                        $cond: {
                            if: {
                                $anyElementTrue: {
                                    $map: {
                                        input: "$favorites",
                                        as: "favorite",
                                        in: { $eq: ['$$favorite.user_id', { $toObjectId: user_id }] }
                                    }
                                }
                            },
                            then: true,
                            else: false
                        }
                    }
                }
            }, {
                $project: {
                    name_product: '$product.name_product',
                    inventory: '$product_variant.quantity',
                    price: '$product_variant.price',
                    quantity: 1,
                    thumb: '$image_product_color.url',
                    name_color: '$color.name_color',
                    hex_color: '$color.hex_color',
                    size: '$size.size',
                    create_at: '$product.createdAt',
                    isFavorite: 1,
                    product_id: '$product._id'
                }
            }
        ])
        return carts
    }

    static addToCart = async ({ body }) => {
        const { product_variant_id, quantity, user_id } = body;
        const user = await userModel.findById(user_id).lean();
        if (!user) throw new NotFoundError('Not found user!');
        const productInCart = await cartModel.findOne({ product_variant_id, user_id }).lean();
        if (productInCart) {
            const cartUpdate = await cartModel.findOneAndUpdate({
                product_variant_id, user_id
            }, {
                $set: { quantity: productInCart.quantity + quantity }
            }, {
                new: true
            });
            if (!cartUpdate) throw new ConflictRequestError('Error update item cart')
            return selectFilesData({ fileds: ['_id', 'product_variant_id', 'quantity', 'user_id'], object: cartUpdate })
        }
        const newCart = await cartModel.create({ product_variant_id, quantity, user_id });
        if (!newCart) throw new ConflictRequestError('Error created item cart')
        return selectFilesData({ fileds: ['_id', 'product_variant_id', 'quantity', 'user_id'], object: newCart })
    }
}

module.exports = CartService