const { ConflictRequestError } = require("../core/error.reponse")
const { COLLECTION_NAME_COLOR } = require("../models/color.model")
const { COLLECTION_NAME_IMAGE_PRODUCT_COLOR } = require("../models/image_product_color.model")
const { productModel, COLLECTION_NAME_PRODUCT } = require("../models/product.model")
const { COLLECTION_NAME_PRODUCT_ORDER } = require("../models/product_order.model")
const { COLLECTION_NAME_PRODUCT_VARIANT } = require("../models/product_variant.model")
const { reviewModel, COLLECTION_NAME_REVIEW } = require("../models/review.model")
const { COLLECTION_NAME_SIZE } = require("../models/size.model")
const { COLLECTION_NAME_USER } = require("../models/user.model")
const { convertToObjectId } = require("../utils")

class ReviewService {
    static getReviewForProduct = async ({ query }) => {
        const { product_id } = query
        const product_Obid = convertToObjectId(product_id)
        const reviews = await reviewModel.aggregate([
            {
                $lookup: {
                    from: COLLECTION_NAME_PRODUCT_ORDER,
                    localField: 'product_order_id',
                    foreignField: '_id',
                    as: 'product_order',
                    pipeline: [
                        {
                            $lookup: {
                                from: COLLECTION_NAME_PRODUCT_VARIANT,
                                localField: 'product_variant_id',
                                foreignField: '_id',
                                as: 'variant',
                                pipeline: [
                                    {
                                        $lookup: {
                                            from: COLLECTION_NAME_SIZE,
                                            localField: 'size_id',
                                            foreignField: '_id',
                                            as: 'size',
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
                                    },
                                    {
                                        $lookup: {
                                            from: COLLECTION_NAME_PRODUCT,
                                            localField: 'product_id',
                                            foreignField: '_id',
                                            as: 'product'
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
                                variant: { $arrayElemAt: ['$variant', 0] }
                            }
                        }
                    ]
                }
            }, {
                $addFields: {
                    product_order: { $arrayElemAt: ['$product_order', 0] }
                }
            }, {
                $project: {
                    rating: 1,
                    content: 1,
                    images_review: 1,
                    user_id: 1,
                    product_id: '$product_order.variant.product._id',
                    color: '$product_order.variant.image_color.color.name_color',
                    size: '$product_order.variant.size.size',
                    createdAt: 1
                }
            }, {
                $match: {
                    product_id: product_Obid
                }
            }, {
                $lookup: {
                    from: COLLECTION_NAME_USER,
                    localField: 'user_id',
                    foreignField: '_id',
                    as: 'user'
                }
            }, {
                $addFields: {
                    email: { $arrayElemAt: ['$user.email', 0] }
                }
            }, {
                $project: {
                    user: 0
                }
            }, {
                $sort: {
                    rating: -1
                }
            }
        ])
        return reviews
    }

    static addReview = async ({ body }) => {
        const { rating, content, images, user_id, product_order_id } = body
        const newReview = await reviewModel.create({
            rating,
            content,
            images_review: images,
            user_id,
            product_order_id
        })
        if (!newReview) throw new ConflictRequestError('Error create review')
        return newReview
    }
}

module.exports = ReviewService