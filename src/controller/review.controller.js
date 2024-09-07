const { CREATED } = require("../core/success.response")
const ReviewService = require("../services/review.service")

class ReviewController {
    static addReview = async (req, res, next) => {
        const { rating, content, images, user_id, product_id } = req.body
        new CREATED({
            message: 'Create review success!',
            metadata: await ReviewService.addReview({ rating, content, images, user_id, product_id })
        }).send(res)
    }
}

module.exports = ReviewController