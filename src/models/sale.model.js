const mongoose = require('mongoose')

const DOCUMENT_NAME_SALE = 'Sale'
const COLLECTION_NAME_SALE = 'Sales'

const saleSchema = new mongoose.Schema({
    discount: {
        type: Number,
        min: 0,
        max: 100,
        require: true
    },
    time_start: { type: Date, required: true },
    time_end: { type: Date, required: true },
    is_active: { type: Boolean, default: true },
    image_sale: { type: Object, default: {} },
    name_sale: {type: String, require: true}
}, {
    timestamps: true,
    collection: COLLECTION_NAME_SALE
})

const saleModel = mongoose.model(DOCUMENT_NAME_SALE, saleSchema)

module.exports = { saleModel, DOCUMENT_NAME_SALE, COLLECTION_NAME_SALE }