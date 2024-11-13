const { ConflictRequestError, BadRequestError } = require("../core/error.reponse")
const { cartModel } = require("../models/cart.model")
const { orderModel } = require("../models/order.model")
const { product_orderModel, COLLECTION_NAME_PRODUCT_ORDER } = require("../models/product_order.model")
const { product_variantModel } = require("../models/product_variant.model")
const { userModel } = require("../models/user.model")
const { voucher_userModel } = require("../models/voucher_user.model")
const { selectMainFilesData, convertVNDToUSD, convertToObjectId } = require("../utils")
const PaymentMethodService = require("./payment_method.service")

class OrderService {
    static getOrdersForUser = async ({ query }) => {
        const { user_id, order_status } = query
        const user_Obid = convertToObjectId(user_id)
        let pipeline = [
            {
                $match: {
                    user_id: user_Obid
                }
            }, {
                $lookup: {
                    from: COLLECTION_NAME_PRODUCT_ORDER,
                    localField: '_id',
                    foreignField: 'order_id',
                    as: 'products_order'
                }
            }, {
                $project: {
                    _id: 1,
                    items: { $size: '$products_order' },
                    quantity: { $sum: '$products_order.quantity' },
                    createdAt: 1,
                    order_status: 1,
                    total_amount: 1
                }
            }, {
                $sort: {
                    createdAt: -1
                }
            }
        ]
        if (order_status) {
            pipeline.push({
                $match: {
                    order_status: order_status
                }
            })
        }
        const orders = await orderModel.aggregate(pipeline)
        return orders
    }

    static findOrderIdByPaypalId = async ({ query }) => {
        const { paypal_id } = query
        const order = await orderModel.findOne({ paypal_id: paypal_id }).lean()
        return order._id
    }

    static createdOrder = async ({ body }) => {
        const {
            user_id, full_name, phone, province_id, province_name, district_id, district_name, 
            ward_code, ward_name, specific_address,
            voucher_user_id, type_voucher, value_voucher,
            delivery_fee, leadtime,
            payment_method, payment_status,
            total_amount,
            order_status,
            products_order,
            cart_ids
        } = body

        let newOrder = await orderModel.create({
            user_id,
            full_name,
            phone,
            province_id,
            province_name,
            district_id,
            district_name,
            ward_code,
            ward_name,
            specific_address,
            voucher_user_id: voucher_user_id || null,
            type_voucher,
            value_voucher,
            delivery_fee,
            leadtime,
            payment_method,
            payment_status,
            total_amount,
            order_status: order_status ? order_status : payment_method === 'COD' ? 'confirming' : 'unpaid'
        })

        if (!newOrder) throw new ConflictRequestError('Conflict creaed new order!')

        if (voucher_user_id) await voucher_userModel.findByIdAndUpdate(voucher_user_id, { is_used: true })

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
            if (!new_product_order) throw new ConflictRequestError('Conflict created product order!')
            new_products_order.push(selectMainFilesData(new_product_order))
        }

        if (new_products_order.length < arr_products_order.length) throw new ConflictRequestError('Conflict created array products order')
        await cartModel.deleteMany({ _id: { $in: cart_ids } })

        const user = await userModel.findById(user_id).lean()
        if (payment_method === 'Zalo Pay') {
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
                phone, email: user.email, items
            })
            if (!zalo_pay) throw new ConflictRequestError('Error create payment zalopay!')
            newOrderResponse.zp_trans_token = zalo_pay.zp_trans_token
        }

        if (payment_method === 'PayPal') {
            const paypal = await PaymentMethodService.payment_paypal({ amount: convertVNDToUSD(total_amount) })
            await orderModel.findByIdAndUpdate(newOrder._id, { paypal_id: paypal.id }, { new: true })
            if (!paypal) throw new ConflictRequestError('Error create payment paypal!')
            const approve = paypal.links.find(link => link.rel === 'approve').href
            newOrderResponse.approve = approve
            newOrderResponse.id_order_paypal = paypal.id
            newOrderResponse.zp_trans_token = ''
        }

        return newOrderResponse
    }
}

module.exports = OrderService