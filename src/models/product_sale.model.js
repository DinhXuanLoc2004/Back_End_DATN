const mongoose = require('mongoose')
const { DOCUMENT_NAME_PRODUCT } = require('./product.model')
const { DOCUMENT_NAME_SALE } = require('./sale.model')

const DOCUMENT_NAME_PRODUCT_SALE = 'Product_Sale'
const COLLECTION_NAME_PRODUCT_SALE = 'Product_Sales'

const product_saleSchema = new mongoose.Schema({
    product_id: {type: mongoose.Types.ObjectId, ref: DOCUMENT_NAME_PRODUCT},
    sale_id: {type: mongoose.Types.ObjectId, ref: DOCUMENT_NAME_SALE}
}, {
    timestamps: true,
    collection: COLLECTION_NAME_PRODUCT_SALE
})

const product_saleModel = mongoose.model(DOCUMENT_NAME_PRODUCT_SALE, product_saleSchema)

module.exports = {product_saleModel, DOCUMENT_NAME_PRODUCT_SALE, COLLECTION_NAME_PRODUCT_SALE}