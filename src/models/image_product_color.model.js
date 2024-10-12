const mongoose = require('mongoose')
const { DOCUMENT_NAME_COLOR } = require('./color.model')

const DOCUMENT_NAME_IMAGE_PRODUCT_COLOR = 'Image_Product_Color'
const COLLECTION_NAME_IMAGE_PRODUCT_COLOR = 'Image_Product_Colors'

const image_product_colorSchema = new mongoose.Schema({
    url: {type: String, required: true},
    public_id: {type: String, required: true},
    color_id: {type: mongoose.Types.ObjectId, ref: DOCUMENT_NAME_COLOR}
}, {
    timestamps: true,
    collection: COLLECTION_NAME_IMAGE_PRODUCT_COLOR
})

const image_product_colorModel = mongoose.model(DOCUMENT_NAME_IMAGE_PRODUCT_COLOR, image_product_colorSchema)

module.exports = {image_product_colorModel, DOCUMENT_NAME_IMAGE_PRODUCT_COLOR, COLLECTION_NAME_IMAGE_PRODUCT_COLOR}