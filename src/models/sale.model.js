const mongoose = require('mongoose')
const { DOCUMENT_NAME_PRODUCT } = require('./product.model')

const DOCUMENT_NAME_SALE = 'Sale'
const COLLECTION_NAME_SALE = 'Sales'

const saleSchema = new mongoose.Schema({
    discount: {
        type: Number,
        min: 0,
        max: 100,
        require: true
    },
    endTime: { type: Date, require: true },
    product_id: { type: mongoose.Schema.Types.ObjectId, ref: DOCUMENT_NAME_PRODUCT, require: true, unique: true }
}, {
    timestamps: true,
    collection: COLLECTION_NAME_SALE
})

saleSchema.index({ endTime: 1 }, { expireAfterSeconds: 0 })

const saleModel = mongoose.model(DOCUMENT_NAME_SALE, saleSchema)

module.exports = { saleModel, DOCUMENT_NAME_SALE, COLLECTION_NAME_SALE }