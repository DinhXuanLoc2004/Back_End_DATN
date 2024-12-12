const { CREATED, OK } = require("../core/success.response")
const ReviewService = require("../services/review.service")

class ReviewController {
    static getReviewForProduct = async (req, res, next) => {
        new OK({
            message: 'Get review for product success!',
            metadata: await ReviewService.getReviewForProduct({ query: req.query })
        }).send(res)
    }

    static addReview = async (req, res, next) => {
        new CREATED({
            message: 'Create review success!',
            metadata: await ReviewService.addReview({ body: req.body })
        }).send(res)
    }
}

module.exports = ReviewController