const mongoose = require('mongoose')

const DOCUMENT_NAME_CATEGORY = 'Category'
const COLLECTION_NAME_CATEGORY = 'Categories'

const categorySchema = new mongoose.Schema({
    name_category: { type: String, require: true },
    parent_id: { type: mongoose.Schema.Types.ObjectId, ref: DOCUMENT_NAME_CATEGORY },
    image_category: { type: Object, default: {} },
    depth: {type: Number, default: 0}
}, {
    timestamps: true,
    collection: COLLECTION_NAME_CATEGORY
})

const categoryModel = mongoose.model(DOCUMENT_NAME_CATEGORY, categorySchema)

module.exports = { categoryModel, DOCUMENT_NAME_CATEGORY, COLLECTION_NAME_CATEGORY }