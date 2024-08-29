const { Schema, model, Types } = require('mongoose')
const { addMinutes } = require('../utils')

const DOCUMENT_NAME = 'Otp'
const COLLECTION_NAME = 'Otps'

const otpSchema = new Schema({
    userId: { type: Types.ObjectId, ref: 'User', unique: true },
    otp: String,
    endTime: Date,
    createAt: Date
}, {
    collection: COLLECTION_NAME
})

otpSchema.index({ endTime: 1 }, { expireAfterSeconds: 0 })

module.exports = model(DOCUMENT_NAME, otpSchema)