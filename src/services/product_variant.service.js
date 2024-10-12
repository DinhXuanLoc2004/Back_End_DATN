const { product_variantModel } = require("../models/product_variant.model")
const { selectFilesData } = require("../utils")

class ProductVariantService {
    static findProductVariant = async ({ query }) => {
        const { product_id, image_product_color_id, size_id } = query
        const product_variant = await product_variantModel.findOne({ product_id, size_id, image_product_color_id }).lean()
        console.log('product_variant::', product_variant);
        return {
            variant: product_variant ? selectFilesData({
                fileds: ['_id', 'product_id', 'size_id', 'image_product_color_id', 'quantity', 'price'],
                object: product_variant
            }) : null
        }
    }
}

module.exports = ProductVariantService