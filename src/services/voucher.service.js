const { ConflictRequestError, NotFoundError, BadRequestError } = require("../core/error.reponse")
const { voucherModel } = require("../models/voucher.model")
const { convertToDate, validateTime, unselectFilesData, convertToObjectId } = require("../utils")
const ProductService = require('../services/product.service')
const { userModel } = require("../models/user.model")
const { COLLECTION_NAME_VOUCHER_USER } = require("../models/voucher_user.model")

class VoucherService {

    static getDetailVoucher = async ({ query }) => {
        const { _id, user_id } = query
        const _Obid = convertToObjectId(_id)
        let user_Obid
        if (user_id) {
            user_Obid = convertToObjectId(user_id)
        }
        const voucher = await voucherModel.aggregate([
            {
                $match: {
                    _id: _Obid
                }
            }, {
                $lookup: {
                    from: COLLECTION_NAME_VOUCHER_USER,
                    localField: '_id',
                    foreignField: 'voucher_id',
                    as: 'vouchers_user',
                    pipeline: [
                        {
                            $match: {
                                ...(user_id ? { user_id: user_Obid } : { user_id: '' })
                            }
                        }
                    ]
                }
            }, {
                $addFields: {
                    is_saved: { $anyElementTrue: '$vouchers_user' },
                    is_used: {
                        $and: [
                            { $gt: [{ $size: '$vouchers_user' }, 0] },
                            {
                                $anyElementTrue: {

                                    $map: {
                                        input: '$vouchers_user',
                                        as: 'voucher_user',
                                        in: { $eq: ['$$voucher_user.is_used', true] }
                                    }

                                }
                            }
                        ]
                    }
                }
            }, {
                $project: {
                    vouchers_user: 0,
                    createdAt: 0,
                    updatedAt: 0,
                    __v: 0
                }
            }
        ])
        if (!voucher) throw new NotFoundError('Not found voucher')
        return voucher ? voucher[0] : {}
    }

    static getAllVouchers = async ({ query }) => {
        const { user_id } = query
        const date = new Date()
        const vouchers = await voucherModel.aggregate([{
            $match: {
                is_active: true,
                is_voucher_new_user: false,
                time_start: { $lt: date },
                time_end: { $gt: date },
                $or: [
                    {
                        quantity: 'Infinity'
                    }, {
                        quantity: { $gt: 0 }
                    }
                ]
            }
        }, {
            $lookup: {
                from: COLLECTION_NAME_VOUCHER_USER,
                localField: '_id',
                foreignField: 'voucher_id',
                as: 'vouchers'
            }
        }, {
            $addFields: {
                is_saved: {
                    $cond: {
                        if: {
                            $and: [
                                { $gt: [user_id, null] },
                                {
                                    $anyElementTrue: {
                                        $map: {
                                            input: '$vouchers',
                                            as: 'voucher',
                                            in: { $eq: ['$$voucher.user_id', { $toObjectId: user_id }] }
                                        }
                                    }
                                }
                            ]
                        },
                        then: true,
                        else: false
                    }
                },
                is_used: {
                    $and: [
                        { $gt: [{ $size: '$vouchers' }, 0] },
                        {
                            $anyElementTrue: {

                                $map: {
                                    input: '$vouchers',
                                    as: 'voucher_user',
                                    in: { $eq: ['$$voucher_user.is_used', true] }
                                }

                            }
                        }
                    ]
                }
            }
        }, {
            $project: {
                _id: 1,
                name_voucher: 1,
                voucher_description: 1,
                voucher_type: 1,
                voucher_value: 1,
                voucher_code: 1,
                thumb: '$image_voucher.url',
                time_start: 1,
                time_end: 1,
                quantity: 1,
                min_order_value: 1,
                is_saved: 1,
                is_used: 1,
                voucher_name: 1
            }
        }])
        return vouchers
    }

    static createVoucher = async ({ body }) => {
        const { voucher_name, voucher_description,
            voucher_type, voucher_value,
            voucher_code, image, time_start, time_end, quantity,
            min_order_value, is_active, is_voucher_new_user } = body
        validateTime(time_start, time_end)
        const voucher = await voucherModel.findOne({ voucher_code }).lean()
        if (voucher) throw new ConflictRequestError('Voucher already exists!')
        const newVoucher = await voucherModel.create({
            voucher_name, voucher_description,
            voucher_type, voucher_value,
            voucher_code, image_voucher: image, time_start, time_end, quantity,
            min_order_value, is_active: is_active ?? true, is_voucher_new_user: is_voucher_new_user ?? false
        })
        if (!newVoucher) throw new ConflictRequestError('Error create voucher!')
        return unselectFilesData({ fields: ['createdAt', 'updatedAt', '__v'], object: newVoucher._doc })
    }
}

module.exports = VoucherService