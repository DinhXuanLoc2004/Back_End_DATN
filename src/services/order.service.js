const { ConflictRequestError, BadRequestError } = require("../core/error.reponse")
const { cartModel } = require("../models/cart.model")
const { orderModel } = require("../models/order.model")
const { product_orderModel } = require("../models/product_order.model")
const { product_variantModel } = require("../models/product_variant.model")
const { selectMainFilesData } = require("../utils")

class OrderService {
    static createdOrder = async ({ body }) => {
        const {
            user_id, full_name, phone, province_city, district, ward_commune, specific_address,
            voucher_user_id, type_voucher, value_voucher,
            delivery_method_id, delivery_fee,
            payment_method_id, payment_status,
            total_amount,
            order_status,
            products_order,
        } = body
        const newOrder = await orderModel.create({
            user_id,
            full_name,
            phone,
            province_city,
            district,
            ward_commune,
            specific_address,
            voucher_user_id,
            type_voucher,
            value_voucher,
            delivery_method_id,
            delivery_fee,
            payment_method_id,
            payment_status,
            total_amount,
            order_status
        })
        if (!newOrder) throw new ConflictRequestError('Conflict creaed new order!')
        const newOrderResponse = selectMainFilesData(newOrder)
        const arr_products_order = JSON.parse(products_order)
        let new_products_order = []
        for (const product_order of arr_products_order) {
            const new_product_order = await product_orderModel.create({
                order_id: newOrderResponse._id,
                product_variant_id: product_order.product_variant_id,
                quantity: product_order.quantity,
                price: product_order.price,
                product_sales: product_order.product_sales,
                total_discount: product_order.total_discount,
            })
            await cartModel.findByIdAndDelete(product_order.cart_id)
            if (!new_product_order) throw new ConflictRequestError('Conflict created product order!')
            new_products_order.push(selectMainFilesData(new_product_order))
        }
        if (new_products_order.length < arr_products_order.length) throw new ConflictRequestError('Conflict created array products order')
        return newOrderResponse
    }
}

module.exports = OrderService