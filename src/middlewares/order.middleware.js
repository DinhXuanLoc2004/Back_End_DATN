const { asyncHandler } = require("../utils");
const { redis_client } = require('../configs/config.redis');
const { product_variantModel } = require("../models/product_variant.model");
const { FailResponse } = require("../core/success.response");

class OrderMiddleWare {
    static checkQuantityOrder = asyncHandler(async (req, res, next) => {
        const { products_order } = req.body
        const arr_products_order = products_order
        const products_not_valid = []
        for (const element of arr_products_order) {
            const product_not_valid = await this.processOrdersSimultaneously({
                product_variant_id: element.product_variant_id,
                quantity_order: element.quantity
            })
            if (product_not_valid) {
                products_not_valid.push(product_not_valid)
            }
        }
        if (products_not_valid.length > 0) {
            return new FailResponse({
                message: 'Invalid product quantity',
                metadata: products_not_valid
            })
        }
        next()
    })

    static processOrdersSimultaneously = async ({ product_variant_id, quantity_order }) => {
        const product_variant = await product_variantModel.findById(product_variant_id).lean()
        const inventory = product_variant.quantity
        const getExistKey = await redis_client.exists(product_variant_id)
        if (!getExistKey) {
            await redis_client.set(product_variant_id, 0, { NX: true })
        }
        let quantity_sold = await redis_client.get(product_variant_id)
        quantity_sold = await redis_client.incrBy(product_variant_id, quantity_order)
        if (Number(quantity_order) > inventory) {
            return product_variant_id
        }
        return ''
    }
}