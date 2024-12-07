const { BadRequestError, ConflictRequestError } = require("../core/error.reponse")
const { COLLECTION_NAME_VOUCHER } = require("../models/voucher.model")
const { voucher_userModel } = require("../models/voucher_user.model")
const { unselectFilesData, convertToObjectId } = require("../utils")

class VoucherUserService {
    static getValidVoucher = async ({ query }) => {
        const { user_id, is_used, min_order_value } = query
        const user_Obid = convertToObjectId(user_id)
        const is_used_boolean = is_used === 'true'
        const date = new Date()
        let pipeline = [
            {
                $match: {
                    user_id: user_Obid
                }
            }, {
                $lookup: {
                    from: COLLECTION_NAME_VOUCHER,
                    localField: 'voucher_id',
                    foreignField: '_id',
                    as: 'voucher'
                }
            }, {
                $addFields: {
                    voucher: { $arrayElemAt: ['$voucher', 0] }
                }
            }, {
                $project: {
                    _id: 1,
                    voucher_name: '$voucher.voucher_name',
                    voucher_description: '$voucher.description',
                    voucher_type: '$voucher.voucher_type',
                    voucher_value: '$voucher.voucher_value',
                    voucher_code: '$voucher.voucher_code',
                    thumb: '$voucher.image_voucher.url',
                    time_start: '$voucher.time_start',
                    time_end: '$voucher.time_end',
                    quantity: '$voucher.quantity',
                    min_order_value: '$voucher.min_order_value',
                    voucher_id: '$voucher._id',
                    is_active: '$voucher.is_active',
                    is_voucher_new_user: '$voucher.is_voucher_new_user',
                    is_used: 1
                }
            }, {
                $match: {
                    is_active: true,
                    time_start: { $lte: date },
                    time_end: { $gte: date },
                    $or: [
                        {
                            quantity: 'Infinity'
                        }, {
                            quantity: { $gt: 0 }
                        }
                    ]
                }
            }
        ]
        if(is_used !== 'all'){
            pipeline.push({
                $match: {
                    is_used: is_used_boolean
                }
            })
        }
        if (min_order_value) {
            const number_min_order_value = Number.parseInt(min_order_value)
            pipeline.push({
                $match: {
                    min_order_value: { $lte: number_min_order_value }
                }
            })
        }
        const vouchers = await voucher_userModel.aggregate(pipeline)
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