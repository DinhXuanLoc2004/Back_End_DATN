const mongoose = require('mongoose')

const COLLECTION_NAME_ADMIN = 'Admins'
const DOCUMENT_NAME_ADMIN = 'Admin'

const adminSchema = new mongoose.Schema({
    email: { type: String, require: true, unique: true },
    password: { type: String, require: true },
    create_by_id: { type: mongoose.Types.ObjectId, ref: DOCUMENT_NAME_ADMIN, default: null },
    fcm: { type: String, default: null },
    role: { type: String, enum: ['Staff', 'Owner'] },
    is_active: {type: Boolean, default: true}
}, {
    timestamps: true,
    collection: COLLECTION_NAME_ADMIN
})

const adminModel = mongoose.model(DOCUMENT_NAME_ADMIN, adminSchema)

module.exports = { adminModel, DOCUMENT_NAME_ADMIN, COLLECTION_NAME_ADMIN }