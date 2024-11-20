const { ConflictRequestError, BadRequestError } = require("../core/error.reponse")
const { cartModel } = require("../models/cart.model")
const { orderModel } = require("../models/order.model")
const { product_orderModel, COLLECTION_NAME_PRODUCT_ORDER } = require("../models/product_order.model")
const { product_variantModel, COLLECTION_NAME_PRODUCT_VARIANT } = require("../models/product_variant.model")
const { userModel, COLLECTION_NAME_USER } = require("../models/user.model")
const { voucher_userModel, COLLECTION_NAME_VOUCHER_USER } = require("../models/voucher_user.model")
const { selectMainFilesData, convertVNDToUSD, convertToObjectId, unselectFilesData, isTimeExceededUTC, convertTimestampToDate } = require("../utils")
const PaymentMethodService = require("./payment_method.service")
const { redis_client } = require('../configs/config.redis')
const { COLLECTION_NAME_PRODUCT } = require("../models/product.model")
const { COLLECTION_NAME_IMAGE_PRODUCT_COLOR } = require("../models/image_product_color.model")
const { COLLECTION_NAME_COLOR } = require("../models/color.model")
const { COLLECTION_NAME_SIZE } = require("../models/size.model")
const { COLLECTION_NAME_CATEGORY } = require("../models/category.model")
const { COLLECTION_NAME_BRAND } = require("../models/brand.model")
const StatusOrderService = require("./status_order.service")
const NotifycationService = require("./notifycation.service")
const { COLLECTION_NAME_STATUS_ORDER } = require("../models/status_order.model")
const { COLLECTION_NAME_VOUCHER } = require("../models/voucher.model")
const DurationsConstants = require("../constants/durations.constants")

class OrderService {
    static findOrderIdByZpTransToken = async ({ query }) => {
        const { zp_trans_token } = query
        const order = await orderModel.findOne({ zp_trans_token }).lean()
        return order._id
    }

    static getUrserIdWithOrderId = async ({ order_id }) => {
        const order = await orderModel.findById(order_id).lean()
        const user_id = order.user_id
        return user_id
    }

    static cancelOrderPaymentDealine = async ({ order_id }) => {
        await StatusOrderService.createStatusOrder({ order_id, status: 'Canceled' })
        const user_id = await this.getUrserIdWithOrderId({ order_id })
        await NotifycationService.pushNofifySingle({
            user_id,
            title: 'Your order has been cancelled!',
            body: 'Your order has been canceled because the payment deadline has passed!'
        })
    }

    static updateStatusOrder = async ({ body }) => {
        const { order_id, status, province_name, district_name, ward_name, specific_address } = body
        const statusOrder = await StatusOrderService.createStatusOrder({ order_id, status, province_name, district_name, ward_name, specific_address })
        const user_id = await this.getUrserIdWithOrderId({ order_id })
        await NotifycationService.pushNofifySingle({
            user_id,
            title: 'Update status order!',
            body: `Status order: ${status} ${province_name && district_name && ward_name
                ? `,The order has arrived in ${province_name} province, ${district_name} district` : ''}`
        })
        if (status === 'Delivered Successfully') {
            const order = await orderModel.findById(order_id)
            if (!order.payment_status) {
                await orderModel.findByIdAndUpdate(order_id, { payment_status: true })
            }
        }
        return selectMainFilesData(statusOrder._doc)
    }

    static getOrderDetail = async ({ query }) => {
        const { _id } = query
        const _Obid = convertToObjectId(_id)
        const order = await orderModel.aggregate([
            {
                $match: {
                    _id: _Obid
                }
            }, {
                $lookup: {
                    from: COLLECTION_NAME_PRODUCT_ORDER,
                    localField: '_id',
                    foreignField: 'order_id',
                    as: 'products_order',
                    pipeline: [
                        {
                            $lookup: {
                                from: COLLECTION_NAME_PRODUCT_VARIANT,
                                localField: 'product_variant_id',
                                foreignField: '_id',
                                as: 'product_variant',
                                pipeline: [
                                    {
                                        $lookup: {
                                            from: COLLECTION_NAME_SIZE,
                                            localField: 'size_id',
                                            foreignField: '_id',
                                            as: 'size'
                                        }
                                    },
                                    {
                                        $lookup: {
                                            from: COLLECTION_NAME_PRODUCT,
                                            localField: 'product_id',
                                            foreignField: '_id',
                                            as: 'product',
                                            pipeline: [
                                                {
                                                    $lookup: {
                                                        from: COLLECTION_NAME_CATEGORY,
                                                        localField: 'category_id',
                                                        foreignField: '_id',
                                                        as: 'category'
                                                    }
                                                }, {
                                                    $lookup: {
                                                        from: COLLECTION_NAME_BRAND,
                                                        localField: 'brand_id',
                                                        foreignField: '_id',
                                                        as: 'brand'
                                                    }
                                                }, {
                                                    $addFields: {
                                                        category: { $arrayElemAt: ['$category', 0] },
                                                        brand: { $arrayElemAt: ['$brand', 0] }
                                                    }
                                                }
                                            ]
                                        }
                                    }, {
                                        $lookup: {
                                            from: COLLECTION_NAME_IMAGE_PRODUCT_COLOR,
                                            localField: 'image_product_color_id',
                                            foreignField: '_id',
                                            as: 'image_color',
                                            pipeline: [
                                                {
                                                    $lookup: {
                                                        from: COLLECTION_NAME_COLOR,
                                                        localField: 'color_id',
                                                        foreignField: '_id',
                                                        as: 'color'
                                                    }
                                                }, {
                                                    $addFields: {
                                                        color: { $arrayElemAt: ['$color', 0] }
                                                    }
                                                }
                                            ]
                                        }
                                    }, {
                                        $addFields: {
                                            product: { $arrayElemAt: ['$product', 0] },
                                            image_color: { $arrayElemAt: ['$image_color', 0] },
                                            size: { $arrayElemAt: ['$size', 0] }
                                        }
                                    }
                                ]
                            }
                        }, {
                            $addFields: {
                                product_variant: { $arrayElemAt: ['$product_variant', 0] }
                            }
                        }, {
                            $project: {
                                quantity: 1,
                                price: 1,
                                discount: 1,
                                name_product: '$product_variant.product.name_product',
                                name_category: '$product_variant.product.category.name_category',
                                name_brand: '$product_variant.product.brand.name_brand',
                                size: '$product_variant.size.size',
                                color: '$product_variant.image_color.color.name_color',
                                thumb_color: '$product_variant.image_color.url'
                            }
                        }
                    ]
                }
            }, {
                $lookup: {
                    from: COLLECTION_NAME_STATUS_ORDER,
                    localField: '_id',
                    foreignField: 'order_id',
                    as: 'order_status',
                    pipeline: [
                        {
                            $project: {
                                _id: 0,
                                order_id: 0,
                                updatedAt: 0,
                                __v: 0
                            }
                        }
                    ]
                }
            }, {
                $project: {
                    createdAt: 0,
                    updatedAt: 0,
                    __v: 0
                }
            }
        ])
        return order
    }

    static getAllOrder = async ({ query }) => {
        const { order_status } = query
        let pipeline = [
            {
                $lookup: {
                    from: COLLECTION_NAME_PRODUCT_ORDER,
                    localField: '_id',
                    foreignField: 'order_id',
                    as: 'products_order'
                }
            }, {
                $lookup: {
                    from: COLLECTION_NAME_USER,
                    localField: 'user_id',
                    foreignField: '_id',
                    as: 'user'
                }
            }, {
                $lookup: {
                    from: COLLECTION_NAME_STATUS_ORDER,
                    localField: '_id',
                    foreignField: 'order_id',
                    as: 'orders_status',
                    pipeline: [
                        {
                            $sort: {
                                createdAt: -1
                            }
                        }
                    ]
                }
            }, {
                $addFields: {
                    user: { $arrayElemAt: ['$user', 0] },
                    order_status: { $arrayElemAt: ['$orders_status', 0] }
                }
            }, {
                $project: {
                    _id: 1,
                    email: '$user.email',
                    full_name: 1,
                    phone: 1,
                    province_name: 1,
                    district_name: 1,
                    ward_name: 1,
                    specific_address: 1,
                    delivery_fee: 1,
                    leadtime: 1,
                    payment_method: 1,
                    payment_status: 1,
                    total_amount: 1,
                    order_status: '$order_status.status',
                    items: { $size: '$products_order' },
                    quantity: { $sum: '$products_order.quantity' },
                    createdAt: 1,
                    order_date: 1
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
                $lookup: {
                    from: COLLECTION_NAME_STATUS_ORDER,
                    localField: '_id',
                    foreignField: 'order_id',
                    as: 'orders_status',
                    pipeline: [
                        {
                            $sort: {
                                createdAt: -1
                            }
                        }
                    ]
                }
            }, {
                $addFields: {
                    order_status: { $arrayElemAt: ['$orders_status', 0] }
                }
            }, {
                $project: {
                    _id: 1,
                    items: { $size: '$products_order' },
                    quantity: { $sum: '$products_order.quantity' },
                    createdAt: 1,
                    order_status: '$order_status.status',
                    total_amount: 1,
                    order_date: 1,
                    leadtime: 1,
                    delivery_fee: 1,
                    payment_method: 1,
                    payment_status: 1
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

    static getProductsContinueOrder = async ({ query }) => {
        const { order_id } = query
        const order_Obid = convertToObjectId(order_id)
        const order = await orderModel.aggregate([
            {
                $match: {
                    _id: order_Obid
                }
            }, {
                $lookup: {
                    from: COLLECTION_NAME_PRODUCT_ORDER,
                    localField: '_id',
                    foreignField: 'order_id',
                    as: 'products_order',
                    pipeline: [
                        {
                            $lookup: {
                                from: COLLECTION_NAME_PRODUCT_VARIANT,
                                localField: 'product_variant_id',
                                foreignField: '_id',
                                as: 'product_variant',
                                pipeline: [
                                    {
                                        $lookup: {
                                            from: COLLECTION_NAME_SIZE,
                                            localField: 'size_id',
                                            foreignField: '_id',
                                            as: 'size'
                                        }
                                    }, {
                                        $lookup: {
                                            from: COLLECTION_NAME_IMAGE_PRODUCT_COLOR,
                                            localField: 'image_product_color_id',
                                            foreignField: '_id',
                                            as: 'image_color',
                                            pipeline: [
                                                {
                                                    $lookup: {
                                                        from: COLLECTION_NAME_COLOR,
                                                        localField: 'color_id',
                                                        foreignField: '_id',
                                                        as: 'color'
                                                    }
                                                }, {
                                                    $addFields: {
                                                        color: { $arrayElemAt: ['$color', 0] }
                                                    }
                                                }
                                            ]
                                        }
                                    }, {
                                        $lookup: {
                                            from: COLLECTION_NAME_PRODUCT,
                                            localField: 'product_id',
                                            foreignField: '_id',
                                            as: 'product',
                                            pipeline: [
                                                {
                                                    $lookup: {
                                                        from: COLLECTION_NAME_BRAND,
                                                        localField: 'brand_id',
                                                        foreignField: '_id',
                                                        as: 'brand'
                                                    }
                                                }, {
                                                    $lookup: {
                                                        from: COLLECTION_NAME_CATEGORY,
                                                        localField: 'category_id',
                                                        foreignField: '_id',
                                                        as: 'category'
                                                    }
                                                }, {
                                                    $addFields: {
                                                        brand: { $arrayElemAt: ['$brand', 0] },
                                                        category: { $arrayElemAt: ['$category', 0] }
                                                    }
                                                }
                                            ]
                                        }
                                    }, {
                                        $addFields: {
                                            size: { $arrayElemAt: ['$size', 0] },
                                            image_color: { $arrayElemAt: ['$image_color', 0] },
                                            product: { $arrayElemAt: ['$product', 0] }
                                        }
                                    }
                                ]
                            }
                        }, {
                            $addFields: {
                                product_variant: { $arrayElemAt: ['$product_variant', 0] }
                            }
                        }, {
                            $project: {
                                _id: 0,
                                product_variant_id: 1,
                                quantity: 1,
                                price: 1,
                                thumb: '$product_variant.image_color.url',
                                size: '$product_variant.size.size',
                                name_color: '$product_variant.image_color.color.name_color',
                                hex_color: '$product_variant.image_color.color.hex_color',
                                name_product: '$product_variant.product.name_product',
                                name_category: '$product_variant.product.category.name_category',
                                name_brand: '$product_variant.product.brand.name_brand',
                                total_discount: '$discount',
                                product_id: '$product_variant.product._id'
                            }
                        }
                    ]
                }
            }, {
                $lookup: {
                    from: COLLECTION_NAME_VOUCHER_USER,
                    localField: 'voucher_user_id',
                    foreignField: '_id',
                    as: 'voucher_detail',
                    pipeline: [
                        {
                            $match: {
                                $expr: { $ne: ['$voucher_user_id', null] }
                            }
                        }, {
                            $lookup: {
                                from: COLLECTION_NAME_VOUCHER,
                                localField: 'voucher_id',
                                foreignField: '_id',
                                as: 'voucher'
                            }
                        }, {
                            $addFields: {
                                voucher: { $arrayElemAt: ['$voucher', 0] }
                            }
                        }, {
                            $project: {
                                _id: 0,
                                is_used: 1,
                                voucher_name: '$voucher.voucher_name',
                                voucher_type: '$voucher.voucher_type',
                                voucher_value: '$voucher.voucher_value',
                                voucher_code: '$voucher.voucher_code',
                                voucher_thumb: '$voucher.image_voucher.url',
                                time_start: '$voucher.time_start',
                                time_end: '$voucher.time_end',
                                min_order_value: '$voucher.min_order_value',
                                is_active: '$voucher.is_active',
                                quantity: '$voucher.quantity',
                                voucher_id: '$voucher._id'
                            }
                        }
                    ]
                }
            },
            {
                $addFields: {
                    voucher_detail: {
                        $cond: {
                            if: { $gt: [{ $size: '$voucher_detail' }, 0] },
                            then: { $arrayElemAt: ['$voucher_detail', 0] },
                            else: null
                        }
                    }
                }
            }, {
                $project: {
                    _id: 0,
                    full_name: 1,
                    phone: 1,
                    province_id: 1,
                    province_name: 1,
                    district_id: 1,
                    district_name: 1,
                    ward_code: 1,
                    ward_name: 1,
                    specific_address: 1,
                    voucher_user_id: 1,
                    type_voucher: 1,
                    value_voucher: 1,
                    payment_method: 1,
                    products_order: 1,
                    voucher_detail: 1
                }
            }
        ])
        return order[0]
    }

    static continueOrder = async ({ query, body }) => {
        const { order_id } = query
        const { full_name, phone, province_id, province_name, district_id, district_name,
            ward_code, ward_name, specific_address,
            voucher_user_id, type_voucher, value_voucher,
            delivery_fee, leadtime,
            payment_method,
            total_amount } = body
        let orderUpdatedResponse = {}

        const order = await orderModel.findById(order_id).lean()

        const orderUpdated = await orderModel.findByIdAndUpdate(
            order_id,
            {
                full_name, phone, province_id, province_name, district_id, district_name,
                ward_code, ward_name, specific_address,
                voucher_user_id: voucher_user_id || null, type_voucher, value_voucher, payment_method, total_amount
            }, {
            new: true
        }
        ).lean()

        orderUpdatedResponse = unselectFilesData({ fields: ['updatedAt', 'createdAt', '__v'], object: orderUpdated })

        if (!orderUpdated) throw new ConflictRequestError('Conflict coutinue order!')
        if (payment_method === 'COD') {
            await StatusOrderService.createStatusOrder({ order_id, status: 'Confirming' })
            await orderModel.findByIdAndUpdate(orderUpdated._id, { delivery_fee, leadtime, order_date: new Date() })
            if (voucher_user_id) {
                if ((order.voucher_user_id != voucher_user_id)) {
                    await voucher_userModel.findByIdAndUpdate(voucher_user_id, { is_used: true })
                    await voucher_userModel.findByIdAndUpdate(order.voucher_user_id, { is_used: false })
                }
                if (order.voucher_user_id && (order.voucher_user_id == voucher_user_id)) {
                    await voucher_userModel.findByIdAndUpdate(voucher_user_id, { is_used: true })
                }
            } else {
                if (order.voucher_user_id) {
                    await voucher_userModel.findByIdAndUpdate(order.voucher_user_id, { is_used: false })
                }
            }
        }

        if (payment_method === 'Zalo Pay') {
            if (isTimeExceededUTC(order.createdAt)) {
                let items = []
                const products_order = await product_orderModel.find({ order_id }).lean()
                for (const item of products_order) {
                    items.push({
                        itemid: item.product_variant_id,
                        itemname: item.name_product,
                        itemprice: item.price,
                        itemquantity: item.quantity
                    })
                }
                const user = await userModel.findById(order.user_id)
                const now = Date.now()
                const zalo_pay = await PaymentMethodService.payment_zalopay({
                    order_id: `${order_id}${now.toString().slice(-5)}`,
                    total_amount,
                    phone,
                    email: user.email,
                    address: `${specific_address}, ${ward_name}, ${district_name}, ${province_name}`,
                    items
                })
                if (!zalo_pay) throw new ConflictRequestError('Error create payment zalopay!')
                orderUpdatedResponse.zp_trans_token = zalo_pay.zp_trans_token
            } else {
                orderUpdatedResponse.zp_trans_token = order.zp_trans_token
            }
            await redis_client.setEx(order_id, DurationsConstants.DURATION_DEALINE_PAYMENT, 'order_id')
            await StatusOrderService.createStatusOrder({ order_id, status: 'Unpaid' })
            if (voucher_user_id) {
                if ((order.voucher_user_id != voucher_user_id)) {
                    await voucher_userModel.findByIdAndUpdate(order.voucher_user_id, { is_used: false })
                }
            } else {
                if (order.voucher_user_id) {
                    await voucher_userModel.findByIdAndUpdate(order.voucher_user_id, { is_used: false })
                }
            }
        }

        if (payment_method === 'PayPal') {
            const paypal = await PaymentMethodService.payment_paypal({ amount: convertVNDToUSD(total_amount) })
            if (!paypal) throw new ConflictRequestError('Error create payment paypal!')
            await orderModel.findByIdAndUpdate(order_id, { paypal_id: paypal.id }, { new: true })
            const approve = paypal.links.find(link => link.rel === 'approve').href
            orderUpdatedResponse.approve = approve
            orderUpdatedResponse.id_order_paypal = paypal.id
            orderUpdatedResponse.zp_trans_token = ''
            await redis_client.setEx(order_id, DurationsConstants.DURATION_DEALINE_PAYMENT, 'orde_id')
            await StatusOrderService.createStatusOrder({ order_id, status: 'Unpaid' })
            if (voucher_user_id) {
                if ((order.voucher_user_id != voucher_user_id)) {
                    await voucher_userModel.findByIdAndUpdate(order.voucher_user_id, { is_used: false })
                }
            } else {
                if (order.voucher_user_id) {
                    await voucher_userModel.findByIdAndUpdate(order.voucher_user_id, { is_used: false })
                }
            }
        }

        return orderUpdatedResponse
    }

    static createdOrder = async ({ body }) => {
        const {
            user_id, full_name, phone, province_id, province_name, district_id, district_name,
            ward_code, ward_name, specific_address,
            voucher_user_id, type_voucher, value_voucher,
            delivery_fee, leadtime,
            payment_method, payment_status,
            total_amount,
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
            payment_method,
            payment_status,
            total_amount
        })

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
            if (!new_product_order) throw new ConflictRequestError('Conflict created product order!')
            new_products_order.push(selectMainFilesData(new_product_order))
        }

        if (new_products_order.length < arr_products_order.length) throw new ConflictRequestError('Conflict created array products order')
        await cartModel.deleteMany({ _id: { $in: cart_ids } })

        const user = await userModel.findById(user_id).lean()
        if (payment_method === 'COD') {
            const date = new Date()
            await StatusOrderService.createStatusOrder({ order_id: newOrder._id, status: 'Confirming' })
            await orderModel.findByIdAndUpdate(newOrder._id, { delivery_fee, leadtime, order_date: date })
            if (voucher_user_id) await voucher_userModel.findByIdAndUpdate(voucher_user_id, { is_used: true })
        }

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
                total_amount, address: `${specific_address}, ${ward_name}, ${district_name}, ${province_name}`,
                phone, email: user.email, items
            })
            if (!zalo_pay) throw new ConflictRequestError('Error create payment zalopay!')
            await orderModel.findByIdAndUpdate(newOrder._id, { zp_trans_token: zalo_pay.zp_trans_token })
            newOrderResponse.zp_trans_token = zalo_pay.zp_trans_token
            await redis_client.setEx(newOrder._id.toString(), DurationsConstants.DURATION_DEALINE_PAYMENT, 'order_id')
            await StatusOrderService.createStatusOrder({ order_id: newOrder._id, status: 'Unpaid' })
        }

        if (payment_method === 'PayPal') {
            const paypal = await PaymentMethodService.payment_paypal({ amount: convertVNDToUSD(total_amount) })
            if (!paypal) throw new ConflictRequestError('Error create payment paypal!')
            await orderModel.findByIdAndUpdate(newOrder._id, { paypal_id: paypal.id }, { new: true })
            const approve = paypal.links.find(link => link.rel === 'approve').href
            newOrderResponse.approve = approve
            newOrderResponse.id_order_paypal = paypal.id
            newOrderResponse.zp_trans_token = ''
            await redis_client.setEx(newOrder._id.toString(), DurationsConstants.DURATION_DEALINE_PAYMENT, 'order_id')
            await StatusOrderService.createStatusOrder({ order_id: newOrder._id, status: 'Unpaid' })
        }

        return newOrderResponse
    }
}

module.exports = OrderService