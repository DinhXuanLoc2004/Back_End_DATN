const { BadRequestError, ConflictRequestError } = require("../core/error.reponse")
const { COLLECTION_NAME_VOUCHER } = require("../models/voucher.model")
const { voucher_userModel } = require("../models/voucher_user.model")
const { unselectFilesData, convertToObjectId } = require("../utils")

class VoucherUserService {
    static getValidVoucher = async ({ query }) => {
        const { user_id } = query
        const user_Obid = convertToObjectId(user_id)
        const vouchers = await voucher_userModel.aggregate([
            {
                $match: {
                    user_id: user_Obid,
                    is_used: false
                }
            }, {
                $lookup: {
                    from: COLLECTION_NAME_VOUCHER,
                    localField: 'voucher_id',
                    foreignField: '_id',
                    as: 'voucher'
                }
            }, {
                $project: {
                    _id: 1,
                    name_voucher: '$voucher.name_voucher',
                    voucher_description: '$voucher.description',
                    voucher_type: '$voucher.voucher_type',
                    voucher_value: '$voucher.voucher_value',
                    voucher_code: '$voucher.voucher_code',
                    thumb: '$voucher.image_voucher.url',
                    time_start: '$voucher.time_start',
                    time_end: '$voucher.time_end',
                    quantity: '$voucher.quantity',
                    min_order_value: '$voucher.min_order_value',
                    voucher_id: '$voucher._id'
                }
            }
        ])
        return vouchers
    }

    static saveVoucher = async ({ body }) => {
        const { voucher_id, user_id } = body
        const hoderVoucherUser = await voucher_userModel.findOne({ voucher_id, user_id }).lean()
        if (hoderVoucherUser) throw BadRequestError('Voucher has been saved!')
        const newVoucherUser = await voucher_userModel.create({
            voucher_id,
            user_id
        })
        if (!newVoucherUser) throw new ConflictRequestError('Conflict created new voucher user!')
        return unselectFilesData({ fields: ['createdAt', 'updatedAt', '__v'], object: newVoucherUser })
    }
}

module.exports = VoucherUserService