const mongoose = require('mongoose')

const DOCUMENT_NAME_COLOR = 'Color'
const COLLECTION_NAME_COLOR = 'Colors'

const colorSchema = new mongoose.Schema({
    hex_color: { type: String, reuqire: true },
    name_color: { type: String, require: true },
    is_delete: { type: Boolean, default: false } 
}, {
    timestamps: true,
    collection: COLLECTION_NAME_COLOR
})

const colorModel = mongoose.model(DOCUMENT_NAME_COLOR, colorSchema)

module.exports = { colorModel, DOCUMENT_NAME_COLOR, COLLECTION_NAME_COLOR }