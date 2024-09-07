const mongoose = require('mongoose')
const { DOCUMENT_NAME_COLOR } = require('./color.model')
const { DOCUMENT_NAME_SIZE } = require('./size.model')
const { DOCUMENT_NAME_CATEGORY } = require('./category.model')
const { DOCUMENT_NAME_BRAND } = require('./brand.model')

const DOCUMENT_NAME_PRODUCT = 'Product'
const COLLECTION_NAME_PRODUCT = 'Products'

const productSchema = new mongoose.Schema({
    name_product: String,
    price: Number,
    inventory_quantity: Number,
    description: String,
    images_product: { type: Array, default: [] },
    colors_id: [{ type: mongoose.Schema.Types.ObjectId, ref: DOCUMENT_NAME_COLOR }],
    sizes_id: [{ type: mongoose.Schema.Types.ObjectId, ref: DOCUMENT_NAME_SIZE }],
    category_id: { type: mongoose.Schema.Types.ObjectId, ref: DOCUMENT_NAME_CATEGORY },
    brand_id: { type: mongoose.Schema.Types.ObjectId, ref: DOCUMENT_NAME_BRAND }
}, {
    timestamps: true,
    collection: COLLECTION_NAME_PRODUCT
})

const productModel = mongoose.model(DOCUMENT_NAME_PRODUCT, productSchema)

module.exports = { productModel, DOCUMENT_NAME_PRODUCT, COLLECTION_NAME_PRODUCT }