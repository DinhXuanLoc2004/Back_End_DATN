const mongoose = require('mongoose')

const DOCUMENT_NAME_SIZE = 'Size'
const COLLECTION_NAME_SIZE = 'Sizes'

const sizeSchema = new mongoose.Schema({
    size: { type: String, reuqire: true, unique: true },
    is_deleted: {type: Boolean, default: false}
}, {
    timestamps: true,
    collection: COLLECTION_NAME_SIZE
})

const sizeModel = mongoose.model(DOCUMENT_NAME_SIZE, sizeSchema)

module.exports = { sizeModel, DOCUMENT_NAME_SIZE, COLLECTION_NAME_SIZE }