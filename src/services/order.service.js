const { ConflictRequestError, BadRequestError } = require("../core/error.reponse")
const { cartModel } = require("../models/cart.model")
const { orderModel, COLLECTION_NAME_ORDER } = require("../models/order.model")
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
const { query } = require("express")
const { COLLECTION_NAME_REVIEW } = require("../models/review.model")
const { RedisService } = require("./redis.service")

class OrderService {
    static refundInventoryQuantity = async ({ order_id }) => {
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
                                as: 'product_variant'
                            }
                        }, {
                            $addFields: {
                                product_variant: { $arrayElemAt: ['$product_variant', 0] }
                            }
                        }
                    ]
                }
            }
        ])
        const product_variants = order[0].products_order.product_variant
        for (let index = 0; index < product_variants.length; index++) {
            const element = product_variants[index];
            await product_variantModel.findByIdAndUpdate(element._id,
                { $inc: { quantity: element.quantity } })
        }
    }

    static getProductDetailOrder = async ({ query }) => {
        const { product_order_id } = query
        const product_order_Obid = convertToObjectId(product_order_id)
        const productDetail = await product_orderModel.aggregate([
            {
                $match: {
                    _id: product_order_Obid
                }
            }, {
                $lookup: {
                    from: COLLECTION_NAME_ORDER,
                    localField: 'order_id',
                    foreignField: '_id',
                    as: 'order'
                },
            }, {
                $lookup: {
                    from: COLLECTION_NAME_PRODUCT_VARIANT,
                    localField: 'product_variant_id',
                    foreignField: '_id',
                    as: 'product_variant',
                    pipeline: [
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
                            $addFields: {
                                product: { $arrayElemAt: ['$product', 0] },
                                size: { $arrayElemAt: ['$size', 0] },
                                image_color: { $arrayElemAt: ['$image_color', 0] }
                            }
                        }
                    ]
                }
            }, {
                $addFields: {
                    product_variant: { $arrayElemAt: ['$product_variant', 0] },
                    order: { $arrayElemAt: ['$order', 0] }
                }
            }, {
                $project: {
                    _id: 0,
                    product_order_id: '$_id',
                    thumb: '$product_variant.image_color.url',
                    name_product: '$product_variant.product.name_product',
                    name_category: '$product_variant.product.category.name_category',
                    name_brand: '$product_variant.product.brand.name_brand',
                    size: '$product_variant.size.size',
                    name_color: '$product_variant.image_color.color.name_color',
                    price: 1,
                    product_id: '$product_variant.product._id',
                    order_id: '$order._id'
                }
            }
        ])

        return productDetail[0]
    }

    static getReviewForOrder = async ({ query }) => {
        const { order_id } = query
        const order_Obid = convertToObjectId(order_id)
        const products = await product_orderModel.aggregate([
            {
                $match: {
                    order_id: order_Obid
                }
            }, {
                $lookup: {
                    from: COLLECTION_NAME_PRODUCT_VARIANT,
                    localField: 'product_variant_id',
                    foreignField: '_id',
                    as: 'product_variant',
                    pipeline: [
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
                                            brand: { $arrayElemAt: ['$brand', 0] },
                                        }
                                    }
                                ]
                            }
                        }, {
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
                            $addFields: {
                                product: { $arrayElemAt: ['$product', 0] },
                                size: { $arrayElemAt: ['$size', 0] },
                                image_color: { $arrayElemAt: ['$image_color', 0] },
                            }
                        }
                    ]
                }
            }, {
                $lookup: {
                    from: COLLECTION_NAME_REVIEW,
                    localField: '_id',
                    foreignField: 'product_order_id',
                    as: 'review'
                }
            }, {
                $addFields: {
                    is_reviewed: {
                        $cond: {
                            if: { $gt: [{ $size: '$review' }, 0] },
                            then: true,
                            else: false
                        }
                    },
                    product_variant: { $arrayElemAt: ['$product_variant', 0] },
                    review_id: {
                        $cond: {
                            if: { $gt: [{ $size: '$review' }, 0] },
                            then: { $arrayElemAt: ['$review._id', 0] },
                            else: ''
                        }
                    }
                }
            }, {
                $project: {
                    _id: 0,
                    product_order_id: '$_id',
                    quantity: 1,
                    price: 1,
                    discount: 1,
                    name_product: '$product_variant.product.name_product',
                    name_category: '$product_variant.product.category.name_category',
                    name_brand: '$product_variant.product.brand.name_brand',
                    thumb: '$product_variant.image_color.url',
                    name_color: '$product_variant.image_color.color.name_color',
                    size: '$product_variant.size.size',
                    product_id: '$product_variant.product._id',
                    is_reviewed: 1,
                    review_id: 1
                }
            }
        ])
        return products
    }

    static removeVoucherForOrder = async ({ order_id }) => {
        await orderModel.findByIdAndUpdate(order_id, { voucher_user_id: null, type_voucher: '', value_voucher: 0 })
    }

    static cancelOrder = async ({ query, body }) => {
        const { order_id } = query
        const { cancellation_reason } = body
        const order = await orderModel.findById(order_id).lean()
        let body_notification = 'Your order has been cancelled!'
        if (order.payment_status) {
            if (order.payment_method === 'Zalo Pay') {
                body_notification = 'Your order has been canceled, the amount will be refunded later!'
                await PaymentMethodService.refund_zalopay({ query: { order_id } })
            }
            if (order.payment_method === 'PayPal') {
                body_notification = 'Your order has been canceled, the amount will be refunded later!'
                await PaymentMethodService.refund_paypal({ query: { order_id } })
            }
        }
        await NotifycationService.pushNofifySingle({ user_id: order.user_id, title: 'Canceled order success!', body: body_notification })
        await StatusOrderService.createStatusOrder({ order_id, status: 'Canceled', cancellation_reason })
        if (order.voucher_user_id) {
            await voucher_userModel.findByIdAndUpdate(order.voucher_user_id, { is_used: false })
            await this.removeVoucherForOrder({ order_id })
        }
        return true
    }

    static findOrderIdByZpTransToken = async ({ query }) => {
        const { zp_trans_token } = query
        const order = await orderModel.findOne({ zp_trans_token }).lean()
        return order._id
    }

    static getUrserIdWithOrderId = async ({ order_id }) => {
        const order = await orderModel.findById(order_id).lean()
        console.log(order);
        const user_id = order.user_id
        return user_id
    }

    static cancelOrderPaymentDealine = async ({ order_id }) => {
        console.log(1);
        await StatusOrderService.createStatusOrder({ order_id, status: 'Canceled', cancellation_reason: 'Payment is past due' })
        const order = await orderModel.findById(order_id).lean()
        if (order.voucher_user_id) {
            await voucher_userModel.findByIdAndUpdate(order.voucher_user_id, { is_used: false })
        }
        await orderModel.findByIdAndUpdate(order_id, { leadtime: null, order_date: null })
        const user_id = await this.getUrserIdWithOrderId({ order_id })
        await NotifycationService.pushNofifySingle({
            user_id,
            title: 'Your order has been cancelled!',
            body: 'Your order has been canceled because the payment deadline has passed!'
        })
    }

    static updateStatusOrder = async ({ body }) => {
        const { order_id, status, province_name, district_name, ward_name, specific_address } = body
        console.log(body);
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
        const { order_id } = query
        const _Obid = convertToObjectId(order_id)
        const order = await orderModel.aggregate([
            {
                $match: {
                    _id: _Obid
                }
            }, {
                $lookup: {
                    from: COLLECTION_NAME_USER,
                    localField: 'user_id',
                    foreignField: '_id',
                    as: 'user',
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
                                _id: 0,
                                product_id: '$product_variant.product_id',
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
                        }, {
                            $sort: {
                                createdAt: -1
                            }
                        }
                    ]
                }
            }, {
                $lookup: {
                    from: COLLECTION_NAME_VOUCHER_USER,
                    localField: 'voucher_user_id',
                    foreignField: '_id',
                    as: 'voucher_used',
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
                                as: 'voucher',
                                pipeline: [
                                    {
                                        $project: {
                                            _id: 0,
                                            voucher_name: 1,
                                            voucher_code: 1,
                                            thumb_voucher: '$image_voucher.url'
                                        }
                                    }
                                ]
                            }
                        }, {
                            $addFields: {
                                voucher: { $arrayElemAt: ['$voucher', 0] }
                            }
                        }, {
                            $project: {
                                _id: 0,
                                voucher_id: 1,
                                voucher_name: '$voucher.voucher_name',
                                voucher_code: '$voucher.voucher_code',
                                thumb_voucher: '$voucher.thumb_voucher'
                            }
                        }
                    ]
                }
            }, {
                $addFields: {
                    current_status: { $arrayElemAt: ['$order_status.status', 0] },
                    email: { $arrayElemAt: ['$user.email', 0] },
                    voucher_used: { $arrayElemAt: ['$voucher_used', 0] }
                }
            }, {
                $project: {
                    createdAt: 0,
                    updatedAt: 0,
                    __v: 0,
                    paypal_id: 0,
                    capture_id: 0,
                    zp_trans_token: 0,
                    zp_trans_id: 0,
                    user: 0
                }
            }
        ])
        return order[0]
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
                    cancellation_reason: '$order_status.cancellation_reason',
                    items: { $size: '$products_order' },
                    quantity: { $sum: '$products_order.quantity' },
                    createdAt: 1,
                    order_date: 1,
                    status_date: '$order_status.createdAt',
                    province: '$order_status.province',
                    district: '$order_status.district'
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
                    cancellation_reason: '$order_status.cancellation_reason',
                    total_amount: 1,
                    order_date: 1,
                    leadtime: 1,
                    delivery_fee: 1,
                    payment_method: 1,
                    payment_status: 1,
                    status_date: '$order_status.createdAt',
                    province: '$order_status.province',
                    district: '$order_status.district'
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
                voucher_user_id: voucher_user_id || null, type_voucher, value_voucher,
                payment_method, total_amount,
                payment_status: false, delivery_fee
            }, {
            new: true
        }
        ).lean()

        orderUpdatedResponse = unselectFilesData({ fields: ['updatedAt', 'createdAt', '__v'], object: orderUpdated })

        if (!orderUpdated) throw new ConflictRequestError('Conflict coutinue order!')
        if (payment_method === 'COD') {
            await StatusOrderService.createStatusOrder({ order_id, status: 'Confirming' })
            await orderModel.findByIdAndUpdate(orderUpdated._id, {
                leadtime, order_date: new Date(),
                zp_trans_token: '', paypal_id: ''
            })
            if (voucher_user_id) {
                if ((order.voucher_user_id != voucher_user_id)) {
                    await voucher_userModel.findByIdAndUpdate(voucher_user_id, { is_used: true })
                    await voucher_userModel.findByIdAndUpdate(order.voucher_user_id, { is_used: false })
                }
                if (order.voucher_user_id == voucher_user_id) {
                    await voucher_userModel.findByIdAndUpdate(voucher_user_id, { is_used: true })
                }
            } else {
                if (order.voucher_user_id) {
                    await voucher_userModel.findByIdAndUpdate(order.voucher_user_id, { is_used: false })
                }
            }
            if (order.payment_method === 'Zalo Pay' || order.payment_method === 'PayPal') {
                await redis_client.del(order_id)
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
                await orderModel.findByIdAndUpdate(order_id, { zp_trans_token: zalo_pay.zp_trans_token, paypal_id: '' })
                orderUpdatedResponse.zp_trans_token = zalo_pay.zp_trans_token
            } else {
                orderUpdatedResponse.zp_trans_token = order.zp_trans_token
            }
            await RedisService.setExOrderID({order_id})
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
            await orderModel.findByIdAndUpdate(order_id, { paypal_id: paypal.id, zp_trans_token: '' }, { new: true })
            const approve = paypal.links.find(link => link.rel === 'approve').href
            orderUpdatedResponse.approve = approve
            orderUpdatedResponse.id_order_paypal = paypal.id
            orderUpdatedResponse.zp_trans_token = ''
            await RedisService.setExOrderID({order_id})
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
            total_amount,
            delivery_fee
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
            await product_variantModel.findByIdAndUpdate(product_order.product_variant_id,
                { $inc: { quantity: - product_order.quantity } })
        }

        if (new_products_order.length < arr_products_order.length) throw new ConflictRequestError('Conflict created array products order')
        await cartModel.deleteMany({ _id: { $in: cart_ids } })

        const user = await userModel.findById(user_id).lean()
        if (payment_method === 'COD') {
            const date = new Date()
            await StatusOrderService.createStatusOrder({ order_id: newOrder._id, status: 'Confirming' })
            await orderModel.findByIdAndUpdate(newOrder._id, { leadtime, order_date: date })
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
            await RedisService.setExOrderID({ order_id: newOrder._id.toString() })
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
            await RedisService.setExOrderID({ order_id: newOrder._id.toString() })
            await StatusOrderService.createStatusOrder({ order_id: newOrder._id, status: 'Unpaid' })
        }

        return newOrderResponse
    }
}

module.exports = OrderService