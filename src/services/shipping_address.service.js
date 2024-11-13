const { default: axios } = require("axios")
const { NotFoundError, ConflictRequestError, BadRequestError } = require("../core/error.reponse")
const { shipping_addressModel } = require("../models/shipping_address.model")
const { userModel } = require("../models/user.model")
const { unselectFilesData, selectMainFilesData } = require("../utils")
require('dotenv').config()

class ShippingAddressService {

    static get_delivery_fee = async ({ query }) => {
        const { to_ward_code, to_district_id } = query
        const from_district_id = 1454
        const delivery_fee = await axios.get(
            `${process.env.BASE_URL_GHN}/shiip/public-api/v2/shipping-order/fee`,
            {
                headers: {
                    "Content-Type": 'application/json',
                    "Token": process.env.TOKEN_GHN,
                    "ShopId": process.env.SHOP_ID_GHN
                },
                data: {
                    service_type_id: 2,
                    to_ward_code,
                    to_district_id: Number(to_district_id),
                    weight: 1000,
                    from_district_id
                }
            }
        )
        const delivery_service = await axios.get(
            `${process.env.BASE_URL_GHN}/shiip/public-api/v2/shipping-order/available-services`,
            {
                headers: {
                    "Content-Type": 'application/json',
                    "token": process.env.TOKEN_GHN
                },
                data: {
                    shop_id: Number(process.env.SHOP_ID_GHN),
                    from_district: from_district_id,
                    to_district: Number(to_district_id)
                }
            }
        )
        const service_id = delivery_service.data.data.filter(service => service.service_type_id === 2)[0].service_id
        const leadtime = await axios.get(
            `${process.env.BASE_URL_GHN}/shiip/public-api/v2/shipping-order/leadtime`,
            {
                headers: {
                    "Content-Type": 'application/json',
                    "Token": process.env.TOKEN_GHN,
                    "ShopId": process.env.SHOP_ID_GHN
                },
                data: {
                    to_ward_code,
                    to_district_id: Number(to_district_id),
                    service_id
                }
            }
        )
        return {
            delivery_fee: delivery_fee.data.data.total,
            leadtime: leadtime.data.data.leadtime
        }
    }

    static get_wards = async ({ query }) => {
        const { district_id } = query
        const response = await axios.get(`${process.env.BASE_URL_GHN}/shiip/public-api/master-data/ward?district_id`, {
            headers: {
                "Content-Type": 'application/json',
                "Token": process.env.TOKEN_GHN,
            },
            data: { district_id: Number(district_id) }
        })
        return response.data.data
    }

    static get_districts = async ({ query }) => {
        const { province_id } = query
        const response = await axios.get(`${process.env.BASE_URL_GHN}/shiip/public-api/master-data/district`, {
            headers: {
                "Content-Type": 'application/json',
                "Token": process.env.TOKEN_GHN,
            },
            data: { province_id: Number(province_id) }
        })
        return response.data.data
    }

    static get_all_province = async () => {
        const response = await axios.get(`${process.env.BASE_URL_GHN}/shiip/public-api/master-data/province`, {
            headers: {
                "Content-Type": 'application/json',
                "Token": process.env.TOKEN_GHN
            }
        })
        return response.data.data
    }

    static deleteShippingAddress = async ({ query }) => {
        const { _id } = query
        const shipping_address = await shipping_addressModel.findById(_id).lean()
        if (shipping_address.is_default) throw new BadRequestError('Default delivery address cannot be deleted!')
        const shipping_address_deleted = await shipping_addressModel.findByIdAndDelete(_id).lean()
        if (!shipping_address_deleted) throw new ConflictRequestError('Error deleted shipping address!')
        return shipping_address_deleted
    }

    static updateShippingAddress = async ({ body, query }) => {
        const { _id } = query
        const { full_name, phone, province_name, province_id, district_name, district_id,
            ward_name, ward_code, specific_address, is_default } = body
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
                full_name, phone, province_name, province_id,
                district_id, district_name, ward_code, ward_name, specific_address, is_default
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
        const { full_name, phone, province_name, province_id, district_name, district_id,
            ward_name, ward_code, specific_address, is_default, user_id } = body
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
            full_name, phone, province_name, province_id, district_name, district_id,
            ward_name, ward_code, specific_address, is_default, user_id
        })
        if (!newshippingAddress) ConflictRequestError('Conficted create shipping address')
        return selectMainFilesData(newshippingAddress._doc)
    }
}

module.exports = ShippingAddressService