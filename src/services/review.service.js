const { ConflictRequestError } = require("../core/error.reponse")
const { productModel } = require("../models/product.model")
const { COLLECTION_NAME_PRODUCT_ORDER } = require("../models/product_order.model")
const { COLLECTION_NAME_PRODUCT_VARIANT } = require("../models/product_variant.model")
const { reviewModel, COLLECTION_NAME_REVIEW } = require("../models/review.model")
const { convertToObjectId } = require("../utils")

class ReviewService {
    static getReviewForProduct = async ({ query }) => {
        const { product_id } = query
        const product_Obid = convertToObjectId(product_id)
        const review = await productModel.aggregate([
            {
                $match: {
                    _id: product_Obid
                }
            }, {
                $lookup: {
                    from: COLLECTION_NAME_PRODUCT_VARIANT,
                    localField: '_id',
                    foreignField: 'product_id',
                    as: 'variants',
                    pipeline: [
                        {
                            $lookup: {
                                from: COLLECTION_NAME_PRODUCT_ORDER,
                                localField: '_id',
                                foreignField: 'product_variant_id',
                                as: 'product_orders',
                                pipeline: [
                                    {
                                        $lookup: {
                                            from: COLLECTION_NAME_REVIEW,
                                            localField: '_id',
                                            foreignField: 'product_order_id',
                                            as: 'review'
                                        }
                                    }, {
                                        $addFields: {
                                            review: { $arrayElemAt: ['$review', 0] }
                                        }
                                    }
                                ]
                            }
                        }
                    ]
                }
            }
        ])
        return review[0]
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