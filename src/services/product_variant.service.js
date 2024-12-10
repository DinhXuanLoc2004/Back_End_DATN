const { cartModel } = require("../models/cart.model")
const { product_variantModel } = require("../models/product_variant.model")
const { COLLECTION_NAME_SIZE } = require("../models/size.model")
const { selectFilesData, convertToObjectId } = require("../utils")

class ProductVariantService {
    static findColorImageProductVariant = async ({ query }) => {
        const { product_id } = query
        const product_Obid = convertToObjectId(product_id)
        const imageColors = await product_variantModel.aggregate([
            {
                $match: {
                    product_id: product_Obid,
                    quantity: { $gt: 0 },
                    is_delete: false
                }
            }, {
                $group: {
                    _id: null,
                    image_product_color_id: { $addToSet: '$image_product_color_id' }
                }
            }, {
                $project: {
                    _id: 0,
                    image_product_color_id: 1
                }
            }
        ])
        const imageColorsResponse = imageColors.map(item => item.image_product_color_id)
        return imageColorsResponse[0]
    }

    static findSizeProductVariant = async ({ query }) => {
        const { product_id, image_product_color_id } = query
        const product_Obid = convertToObjectId(product_id)
        const image_product_color_Obid = convertToObjectId(image_product_color_id)
        const sizes = await product_variantModel.aggregate([
            {
                $match: {
                    product_id: product_Obid,
                    image_product_color_id: image_product_color_Obid,
                    quantity: { $gt: 0 },
                    is_delete: false
                }
            }, {
                $project: {
                    _id: 0,
                    size_id: 1
                }
            }
        ])
        const sizesResponse = sizes.map((item) => item.size_id)
        return sizesResponse
    }

    static findProductVariant = async ({ query }) => {
        const { product_id, image_product_color_id, size_id, user_id } = query
        const product_variant = await product_variantModel.findOne({ product_id, size_id, image_product_color_id, is_delete: false }).lean()
        let cart = undefined
        if (product_variant) {
            cart = await cartModel.findOne({ user_id, product_variant_id: product_variant._id }).lean()
        }
        const quantity_in_cart = cart ? cart.quantity : 0
        const max_quantity = product_variant ? product_variant.quantity - quantity_in_cart : 0
        return {
            variant: product_variant ? selectFilesData({
                fileds: ['_id', 'product_id', 'size_id', 'image_product_color_id', 'quantity', 'price'],
                object: product_variant
            }) : null,
            max_quantity
        }
    }
}

module.exports = ProductVariantService