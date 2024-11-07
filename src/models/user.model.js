const mongoose = require('mongoose'); // Erase if already required

const DOCUMENT_NAME_USER = 'User'
const COLLECTION_NAME_USER = 'Users'

// Declare the Schema of the Mongo model
var userSchema = new mongoose.Schema({
    email: {
        type: String,
        required: true,
        unique: true,
    },
    password: {
        type: String,
        required: true,
    },
    status: {
        type: String,
        enum: ['active', 'inactive'],
        default: 'inactive'
    },
    fcm_token: { type: String, default: "" }
}, {
    timestamps: true,
    collection: COLLECTION_NAME_USER
});
const userModel = mongoose.model(DOCUMENT_NAME_USER, userSchema)
//Export the model
module.exports = { userModel, DOCUMENT_NAME_USER, COLLECTION_NAME_USER };