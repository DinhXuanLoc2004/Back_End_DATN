const mongoose = require('mongoose')

const DOCUMENT_NAME_BRAND = 'Brand'
const COLLECTION_NAME_BRAND = 'Brands'

const brandSchema = new mongoose.Schema({
    name_brand: { type: String, require: true },
    image_brand: {type: Object, default: {}},
    is_delete: { type: Boolean, default: false }
}, {
    timestamps: true,
    collection: COLLECTION_NAME_BRAND
})

const brandModel = mongoose.model(DOCUMENT_NAME_BRAND, brandSchema)

module.exports = { brandModel, DOCUMENT_NAME_BRAND, COLLECTION_NAME_BRAND }