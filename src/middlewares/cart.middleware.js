const { COLLECTION_NAME_PRODUCT } = require("../models/product.model");
const { product_variantModel } = require("../models/product_variant.model");
const { asyncHandler, convertToObjectId } = require("../utils");
const { FailResponse } = require('../core/success.response');
const { cartModel } = require("../models/cart.model");

class CartMiddleWare {
    static checkProductActive = asyncHandler(async (req, res, next) => {
        const { product_variant_id, quantity, user_id } = req.body
        const product_variant_Obid = convertToObjectId(product_variant_id)
        const product_variant = await product_variantModel.aggregate([
            {
                $match: {
                    _id: product_variant_Obid
                }
            }, {
                $lookup: {
                    from: COLLECTION_NAME_PRODUCT,
                    localField: 'product_id',
                    foreignField: '_id',
                    as: 'product',
                    pipeline: [
                        {
                            $match: {
                                is_public: true,
                                is_delete: false
                            }
                        }
                    ]
                }
            }, {
                $addFields: {
                    product: { $arrayElemAt: ['$product', 0] }
                }
            }
        ])
        const variant = product_variant[0]
        if (!variant || !variant.product) {
            return new FailResponse({
                message: 'Invalid product'
            }).send(res)
        }
        next()
    })
}

module.exports = CartMiddleWare