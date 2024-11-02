const { NotFoundError, ConflictRequestError, BadRequestError } = require("../core/error.reponse")
const { shipping_addressModel } = require("../models/shipping_address.model")
const { userModel } = require("../models/user.model")
const { unselectFilesData, selectMainFilesData } = require("../utils")

class ShippingAddressService {
    static deleteShippingAddress = async ({ query }) => {
        const { _id } = query
        const shipping_address = await shipping_addressModel.findById(_id).lean()
        if (shipping_address.is_default) throw new ConflictRequestError('Default delivery address cannot be deleted!')
        const shipping_address_deleted = await shipping_addressModel.findByIdAndDelete(_id).lean()
        if (!shipping_address_deleted) throw new ConflictRequestError('Error deleted shipping address!')
        return shipping_address_deleted
    }

    static updateShippingAddress = async ({ body, query }) => {
        const { _id } = query
        const { full_name, phone, province_city, district,
            ward_commune, specific_address, is_default } = body
        const shipping_address = await shipping_addressModel.findById(_id).lean()
        if (!shipping_address) throw new NotFoundError('Not found shipping address!')
        if (is_default) {
            await shipping_addressModel.updateMany({
                user_id: shipping_address.user_id
            }, {
                $set: {
                    is_default: false
                }
            })
        }
        if (!is_default && shipping_address.is_default) throw new ConflictRequestError('Cannot update default status is false!')
        const shipping_address_updated = await shipping_addressModel.findByIdAndUpdate(_id, {
            $set: {
                full_name, phone, province_city,
                district, ward_commune, specific_address, is_default
            }
        }, {
            new: true
        })
        if (!shipping_address_updated) throw new ConflictRequestError('Conflict update status default shipping address')
        return shipping_address_updated
    }

    static updateStatusDefaultAddress = async ({ query }) => {
        const { _id } = query
        const shipping_address = await shipping_addressModel.findById(_id).lean()
        if (!shipping_address) throw new NotFoundError('Not found shipping address!')
        if (shipping_address.is_default) return 'The shipping address is in default status!'
        await shipping_addressModel.updateMany({
            user_id: shipping_address.user_id
        }, {
            $set: {
                is_default: false
            }
        })
        const shipping_address_updated = await shipping_addressModel.findByIdAndUpdate(_id, {
            $set: {
                is_default: true
            }
        }, {
            new: true
        })
        if (!shipping_address_updated) throw new ConflictRequestError('Conflict update status default shipping address')
        return shipping_address_updated
    }

    static getShippingAddressDefault = async ({ query }) => {
        const { user_id } = query
        const user = await userModel.findById(user_id).lean()
        if (!user) throw new NotFoundError('Not found user')
        const shipping_address = await shipping_addressModel.findOne({ user_id, is_default: true }).lean()
        return unselectFilesData({ fields: ['createdAt', 'updatedAt', '__v'], object: shipping_address })
    }

    static getDetailShippingAddress = async ({ query }) => {
        const { _id } = query
        const shipping_address = await shipping_addressModel.findById(_id).lean()
        if (!shipping_address) throw new NotFoundError('Not found shipping address!')
        return unselectFilesData({ fields: ['createdAt', 'updatedAt', '__v'], object: shipping_address })
    }

    static getAllShippingAddress = async ({ query }) => {
        const { user_id } = query
        const user = await userModel.findById(user_id).lean()
        if (!user) throw new NotFoundError('Not found user')
        const shipping_addresses = await shipping_addressModel.aggregate([
            {
                $match: {
                    user_id: user._id
                }
            }, {
                $project: {
                    createdAt: 0,
                    updatedAt: 0,
                    __v: 0
                }
            }
        ])
        return shipping_addresses
    }

    static addShippingAddress = async ({ body }) => {
        const { full_name, phone, province_city, district,
            ward_commune, specific_address, is_default, user_id } = body
        const user = await userModel.findById(user_id).lean()
        if (!user) throw new NotFoundError('Not found user')
        if (is_default) {
            await shipping_addressModel.updateMany({
                user_id
            }, {
                $set: {
                    is_default: false
                }
            })
        }
        const newshippingAddress = await shipping_addressModel.create({
            full_name, phone, province_city, district,
            ward_commune, specific_address, is_default, user_id
        })
        if (!newshippingAddress) ConflictRequestError('Conficted create shipping address')
        return selectMainFilesData(newshippingAddress._doc)
    }
}

module.exports = ShippingAddressService