const mongoose = require('mongoose')
const { DOCUMENT_NAME_COLOR } = require('./color.model')
const { DOCUMENT_NAME_SIZE } = require('./size.model')
const { DOCUMENT_NAME_CATEGORY } = require('./category.model')
const { DOCUMENT_NAME_BRAND } = require('./brand.model')
const { DOCUMENT_NAME_SALE } = require('./sale.model')

const DOCUMENT_NAME_PRODUCT = 'Product'
const COLLECTION_NAME_PRODUCT = 'Products'

const productSchema = new mongoose.Schema({
    name_product: {type: String, required: true},
    description: {type: String, required: true},
    is_trending: {type: Boolean, default: false},
    images_product: { type: Array, default: [] },
    category_id: { type: mongoose.Schema.Types.ObjectId, ref: DOCUMENT_NAME_CATEGORY },
    brand_id: { type: mongoose.Schema.Types.ObjectId, ref: DOCUMENT_NAME_BRAND },
}, {
    timestamps: true,
    collection: COLLECTION_NAME_PRODUCT
})

const productModel = mongoose.model(DOCUMENT_NAME_PRODUCT, productSchema)

module.exports = { productModel, DOCUMENT_NAME_PRODUCT, COLLECTION_NAME_PRODUCT }