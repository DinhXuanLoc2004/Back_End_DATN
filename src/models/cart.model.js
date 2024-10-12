const mongoose = require('mongoose')
const { DOCUMENT_NAME_PRODUCT } = require('./product.model')
const { DOCUMENT_NAME_COLOR } = require('./color.model')
const { DOCUMENT_NAME_USER } = require('./user.model')
const { DOCUMENT_NAME_SIZE } = require('./size.model')
const { DOCUMENT_NAME_PRODUCT_VARIANT } = require('./product_variant.model')

const DOCUMENT_NAME_CART = 'Cart'
const COLLECTION_NAME_CART = 'Carts'

const cartSchame = new mongoose.Schema({
    product_variant_id: {type: mongoose.Types.ObjectId, ref: DOCUMENT_NAME_PRODUCT_VARIANT},
    quantity: {type: Number, require: true},
    user_id: {type: mongoose.Types.ObjectId, ref: DOCUMENT_NAME_USER}
}, {
    timestamps: true,
    collection: COLLECTION_NAME_CART
})

const cartModel = mongoose.model(DOCUMENT_NAME_CART, cartSchame)

module.exports = {cartModel, DOCUMENT_NAME_CART, COLLECTION_NAME_CART}