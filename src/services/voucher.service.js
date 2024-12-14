const { ConflictRequestError, NotFoundError, BadRequestError } = require("../core/error.reponse")
const { voucherModel } = require("../models/voucher.model")
const { convertToDate, validateTime, unselectFilesData, convertToObjectId, convertBoolen } = require("../utils")
const ProductService = require('../services/product.service')
const { userModel, COLLECTION_NAME_USER } = require("../models/user.model")
const { COLLECTION_NAME_VOUCHER_USER, voucher_userModel } = require("../models/voucher_user.model")

class VoucherService {
    static toggleActiveVoucher = async ({ query }) => {
        const { _id } = query
        const voucher = await voucherModel.findById(_id).lean()
        const updatedVoucher = await voucherModel.findByIdAndUpdate(_id, { is_active: !voucher.is_active }, { new: true })
        return updatedVoucher
    }

    static getAllVoucherToAdmin = async () => {
        const vouchers = await voucherModel.find().lean()
        return vouchers
    }

    static getVoucherDetailUpdate = async ({ query }) => {
        const { _id } = query
        const _Obid = convertToObjectId(_id)
        const voucher = await voucherModel.aggregate([
            {
                $match: {
                    _id: _Obid
                }
            },
            {
                $lookup: {
                    from: COLLECTION_NAME_VOUCHER_USER,
                    localField: '_id',
                    foreignField: 'voucher_id',
                    as: 'voucher_users',
                    pipeline: [
                        {
                            $match: {
                                is_active: true
                            }
                        },
                        {
                            $lookup: {
                                from: COLLECTION_NAME_USER,
                                localField: 'user_id',
                                foreignField: '_id',
                                as: 'user'
                            }
                        }, {
                            $addFields: {
                                user: { $arrayElemAt: ['$user', 0] }
                            }
                        }
                    ]
                }
            }
        ])
        return voucher
    }

    static updateVoucher = async ({ query, body }) => {
        const { _id } = query
        const { voucher_name, voucher_description,
            voucher_type, voucher_value, voucher_code,
            image, time_start, time_end,
            quantity, min_order_value, users, is_voucher_new_user } = body
        const updatedVoucher = await voucherModel.findByIdAndUpdate(_id, {
            voucher_name,
            voucher_description,
            voucher_type,
            voucher_code,
            voucher_value,
            image_voucher: image,
            time_start,
            time_end,
            quantity,
            min_order_value,
            is_voucher_new_user
        }, {
            new: true
        })
        if (users) {
            const old_user_vouchers = await voucher_userModel.find({
                voucher_id: _id, is_active: true, is_used: false
            }).lean()
            const arr_users = JSON.parse(users)
            const new_users = arr_users.filter(item => !old_user_vouchers.includes(item))
            const remove_users = old_user_vouchers.filter(item => !arr_users.includes(item))
            if (new_users.length > 0) {
                for (let index = 0; index < new_users.length; index++) {
                    const element = new_users[index];
                    await voucher_userModel.create({
                        voucher_id: _id,
                        user_id: element
                    })
                }
            }
            if (remove_users.length > 0) {
                await voucher_userModel.deleteMany({ user_id: { $in: remove_users } })
            }
        }
        return updatedVoucher
    }

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
        const { user_id, active, is_public = 'false' } = query
        const date = new Date()
        let pipeline = [{
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
                voucher_name: 1,
                is_active: 1,
                is_voucher_new_user: 1
            }
        }]
        const condition_public = convertBoolen(is_public)
        if (active) {
            const condition = convertBoolen(active)
            if (condition) {
                pipeline = [
                    {
                        $match: {
                            is_active: true,
                            is_voucher_new_user: !condition_public,
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
                    },
                    ...pipeline
                ]
            } else {
                pipeline = [
                    {
                        $match: {
                            is_active: false,
                            is_voucher_new_user: !condition_public,
                            time_end: { $lt: date },
                            $or: [
                                {
                                    quantity: { $ne: 'Infinity' }
                                }, {
                                    quantity: { $lte: 0 }
                                }
                            ]
                        }
                    },
                    ...pipeline
                ]

            }
        }
        const vouchers = await voucherModel.aggregate(pipeline)
        return vouchers
    }

    static createVoucher = async ({ body }) => {
        const { voucher_name, voucher_description,
            voucher_type, voucher_value,
            voucher_code, image, time_start, time_end, quantity,
            min_order_value, is_active, is_voucher_new_user, users } = body
        validateTime(time_start, time_end)
        const voucher = await voucherModel.findOne({ voucher_code }).lean()
        if (voucher) throw new ConflictRequestError('Voucher already exists!')
        const newVoucher = await voucherModel.create({
            voucher_name, voucher_description,
            voucher_type, voucher_value,
            voucher_code, image_voucher: image, time_start, time_end, quantity,
            min_order_value, is_active: is_active ?? true, 
            is_voucher_new_user: users ? true : is_voucher_new_user !== undefined ? is_voucher_new_user : false
        })
        if (users) {
            const arr_users = JSON.parse(users)
            for (let index = 0; index < arr_users.length; index++) {
                const element = arr_users[index];
                await voucher_userModel.create({
                    user_id: element,
                    voucher_id: newVoucher._id
                })
            }
        }
        if (!newVoucher) throw new ConflictRequestError('Error create voucher!')
        return unselectFilesData({ fields: ['createdAt', 'updatedAt', '__v'], object: newVoucher._doc })
    }
}

module.exports = VoucherService