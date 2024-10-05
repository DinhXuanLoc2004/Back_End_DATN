const { CREATED } = require("../core/success.response")
const ReviewService = require("../services/review.service")

class ReviewController {
    static addReview = async (req, res, next) => {
        new CREATED({
            message: 'Create review success!',
            metadata: await ReviewService.addReview({ body: req.body })
        }).send(res)
    }
}

module.exports = ReviewController