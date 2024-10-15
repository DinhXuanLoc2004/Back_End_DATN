const { CREATED, OK } = require('../core/success.response')
const ProductVariantService = require('../services/product_variant.service')

class ProductVariantController {
    static findColorImageProductVariant = async (req, res, next) => {
        new OK({
            message: 'Find image color product variant success',
            metadata: await ProductVariantService.findColorImageProductVariant({ query: req.query })
        }).send(res)
    }

    static findSizeProductVariant = async (req, res, next) => {
        new OK({
            message: 'Find size product variant success',
            metadata: await ProductVariantService.findSizeProductVariant({ query: req.query })
        }).send(res)
    }

    static fintProductVariant = async (req, res, next) => {
        new OK({
            message: 'Find product variant success',
            metadata: await ProductVariantService.findProductVariant({ query: req.query })
        }).send(res)
    }
}

module.exports = ProductVariantController