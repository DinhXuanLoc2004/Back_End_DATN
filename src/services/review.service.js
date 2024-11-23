const { ConflictRequestError } = require("../core/error.reponse")
const { reviewModel } = require("../models/review.model")

class ReviewService {
    static addReview = async ({ body }) => {
        const {rating, content, images, user_id, product_order_id} = body
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