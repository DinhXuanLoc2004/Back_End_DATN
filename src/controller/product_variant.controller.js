const {CREATED, OK} = require('../core/success.response')
const ProductVariantService = require('../services/product_variant.service')

class ProductVariantController {
    static fintProductVariant = async (req, res, next) => {
        new OK({
            message: 'Find product variant success',
            metadata: await ProductVariantService.findProductVariant({query: req.query})
        }).send(res)
    }
}

module.exports = ProductVariantController