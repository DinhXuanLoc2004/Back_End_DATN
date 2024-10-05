const mongoose = require('mongoose')
const { DOCUMENT_NAME_USER } = require('./user.model')
const { DOCUMENT_NAME_PRODUCT } = require('./product.model')
const { DOCUMENT_NAME_PRODUCT_VARIANT } = require('./product_variant.model')

const DOCUMENT_NAME_REVIEW = 'Review'
const COLLECTION_NAME_REVIEW = 'Reviews'

const reviewSchema = new mongoose.Schema({
    rating: { type: Number, min: 1, max: 5, require: true },
    content: { type: String, require: true },
    images_review: { type: Array, default: [] },
    user_id: { type: mongoose.Schema.Types.ObjectId, ref: DOCUMENT_NAME_USER, require: true },
    product_variant_id: {type: mongoose.Schema.Types.ObjectId, ref: DOCUMENT_NAME_PRODUCT_VARIANT, required: true}
}, {
    timeseries: true,
    collection: COLLECTION_NAME_REVIEW
})

const reviewModel = mongoose.model(DOCUMENT_NAME_REVIEW, reviewSchema)

module.exports = { reviewModel, DOCUMENT_NAME_REVIEW, COLLECTION_NAME_REVIEW }

