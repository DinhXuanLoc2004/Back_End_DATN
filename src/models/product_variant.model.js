const mongoose = require('mongoose')
const { DOCUMENT_NAME_PRODUCT } = require('./product.model')
const { DOCUMENT_NAME_SIZE } = require('./size.model')
const { DOCUMENT_NAME_COLOR } = require('./color.model');
const { DOCUMENT_NAME_IMAGE_PRODUCT_COLOR } = require('./image_product_color.model');

const DOCUMENT_NAME_PRODUCT_VARIANT = 'Product_Variant';
const COLLECTION_NAME_PRODUCT_VARIANT = 'Product_Variants'

const product_variantSchema = new mongoose.Schema({
    quantity: { type: Number, required: true },
    price: { type: Number, required: true },
    product_id: { type: mongoose.Types.ObjectId, ref: DOCUMENT_NAME_PRODUCT, required: true },
    size_id: { type: mongoose.Types.ObjectId, ref: DOCUMENT_NAME_SIZE, required: true },
    image_product_color_id: { type: mongoose.Types.ObjectId, ref: DOCUMENT_NAME_IMAGE_PRODUCT_COLOR, required: true },
    is_delete: { type: Boolean, default: false }
}, {
    timestamps: true,
    collection: COLLECTION_NAME_PRODUCT_VARIANT
})

const product_variantModel = mongoose.model(DOCUMENT_NAME_PRODUCT_VARIANT, product_variantSchema);

module.exports = { product_variantModel, DOCUMENT_NAME_PRODUCT_VARIANT, COLLECTION_NAME_PRODUCT_VARIANT };