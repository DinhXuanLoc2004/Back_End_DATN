const { Schema, model, Types } = require('mongoose')
const { DOCUMENT_NAME_USER } = require('./user.model')

const DOCUMENT_NAME_OTP = 'Otp'
const COLLECTION_NAME_OTP = 'Otps'

const otpSchema = new Schema({
    userId: { type: Types.ObjectId, ref: DOCUMENT_NAME_USER, unique: true },
    otp: String,
    endTime: Date,
    createAt: Date
}, {
    collection: COLLECTION_NAME_OTP
})

otpSchema.index({ endTime: 1 }, { expireAfterSeconds: 0 })

const otpModel = model(DOCUMENT_NAME_OTP, otpSchema)

module.exports = { otpModel, DOCUMENT_NAME_OTP, COLLECTION_NAME_OTP }