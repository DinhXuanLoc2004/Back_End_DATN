const { ConflictRequestError, BadRequestError } = require("../core/error.reponse")
const { cartModel } = require("../models/cart.model")
const { orderModel } = require("../models/order.model")
const { payment_methodModel } = require("../models/payment_method.model")
const { product_orderModel } = require("../models/product_order.model")
const { product_variantModel } = require("../models/product_variant.model")
const { userModel } = require("../models/user.model")
const { voucher_userModel } = require("../models/voucher_user.model")
const { selectMainFilesData } = require("../utils")
const PaymentMethodService = require("./payment_method.service")

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

        await voucher_userModel.findByIdAndUpdate(voucher_user_id, { is_used: true })
        if (!newOrder) throw new ConflictRequestError('Conflict creaed new order!')
        let newOrderResponse = {}
        newOrderResponse = selectMainFilesData(newOrder._doc)

        const arr_products_order = products_order
        let new_products_order = []

        for (const product_order of arr_products_order) {
            const new_product_order = await product_orderModel.create({
                order_id: newOrderResponse._id,
                product_variant_id: product_order.product_variant_id,
                quantity: product_order.quantity,
                price: product_order.price,
                discount: product_order.discount,
            })
            await cartModel.findByIdAndDelete(product_order.cart_id)
            if (!new_product_order) throw new ConflictRequestError('Conflict created product order!')
            new_products_order.push(selectMainFilesData(new_product_order))
        }

        if (new_products_order.length < arr_products_order.length) throw new ConflictRequestError('Conflict created array products order')

        const payment_method = await payment_methodModel.findById(payment_method_id).lean()
        const user = await userModel.findById(user_id).lean()
        if (payment_method.name_payment === 'Zalo Pay') {
            const items = []
            for (const item of arr_products_order) {
                items.push({
                    itemid: item.product_variant_id,
                    itemname: item.name_product,
                    itemprice: item.price,
                    itemquantity: item.quantity
                })
            }
            const zalo_pay = await PaymentMethodService.payment_zalopay({
                order_id: newOrder._id,
                total_amount, address: `${specific_address}, ${ward_commune}, ${district}, ${province_city}`,
                phone, email: user._id, items
            })
            if (!zalo_pay) throw new ConflictRequestError('Error create payment zalopay!')
            newOrderResponse.payment_type = 'Zalo Pay'
            newOrderResponse.zp_trans_token = zalo_pay.zp_trans_token
        }

        return newOrderResponse
    }
}

module.exports = OrderService