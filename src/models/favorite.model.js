const mongoose = require('mongoose')
const { DOCUMENT_NAME_COLOR } = require('./color.model')
const { DOCUMENT_NAME_SIZE } = require('./size.model')
const { DOCUMENT_NAME_PRODUCT } = require('./product.model')
const { DOCUMENT_NAME_USER } = require('./user.model')
const { DOCUMENT_NAME_PRODUCT_VARIANT } = require('./product_variant.model')

const DOCUMENT_NAME_FAVORITE = 'Favorite'
const COLLECTION_NAME_FAVORITE = 'Favorites'

const favoriteSchema = new mongoose.Schema({
    product_id: {type: mongoose.Types.ObjectId, ref: DOCUMENT_NAME_PRODUCT},
    user_id: { type: mongoose.Schema.Types.ObjectId, ref: DOCUMENT_NAME_USER }
}, {
    timestamps: true,
    collection: COLLECTION_NAME_FAVORITE
})

const favoriteModel = mongoose.model(DOCUMENT_NAME_FAVORITE, favoriteSchema)

module.exports = { favoriteModel, DOCUMENT_NAME_FAVORITE, COLLECTION_NAME_FAVORITE }

