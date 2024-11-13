const { CREATED, OK } = require('../core/success.response')
const ShippingAddressService = require('../services/shipping_address.service')

class ShippingAddressController {
    static get_delivery_fee = async (req, res, next) => {
        new OK({
            message: 'Get delivery fee success!',
            metadata: await ShippingAddressService.get_delivery_fee({ query: req.query })
        }).send(res)
    }

    static get_warts = async (req, res, next) => {
        new OK({
            message: 'Get wards success!',
            metadata: await ShippingAddressService.get_wards({ query: req.query })
        }).send(res)
    }

    static get_districts = async (req, res, netx) => {
        new OK({
            message: 'Get districts success!',
            metadata: await ShippingAddressService.get_districts({ query: req.query })
        }).send(res)
    }

    static get_all_province = async (req, res, next) => {
        new OK({
            message: 'Get all province success',
            metadata: await ShippingAddressService.get_all_province()
        }).send(res)
    }

    static deleteShippingAddress = async (req, res, next) => {
        new OK({
            message: 'Delete shipping address success!',
            metadata: await ShippingAddressService.deleteShippingAddress({ query: req.query })
        }).send(res)
    }

    static updateShippingAddress = async (req, res, next) => {
        new OK({
            message: 'Update shipping address success!',
            metadata: await ShippingAddressService.updateShippingAddress({ body: req.body, query: req.query })
        }).send(res)
    }

    static updateStatusDefaultAddress = async (req, res, next) => {
        new OK({
            message: 'Update status default shipping address success!',
            metadata: await ShippingAddressService.updateStatusDefaultAddress({ query: req.query })
        }).send(res)
    }

    static getShippingAddressDefault = async (req, res, next) => {
        new OK({
            message: 'Get default shipping address success!',
            metadata: await ShippingAddressService.getShippingAddressDefault({ query: req.query })
        }).send(res)
    }

    static getDetailShippingAddress = async (req, res, next) => {
        new OK({
            message: 'Get detail shipping address success!',
            metadata: await ShippingAddressService.getDetailShippingAddress({ query: req.query })
        }).send(res)
    }

    static getAllShippingAddress = async (req, res, next) => {
        new OK({
            message: 'Get all shipping address success!',
            metadata: await ShippingAddressService.getAllShippingAddress({ query: req.query })
        }).send(res)
    }

    static addShippingAddress = async (req, res, next) => {
        new CREATED({
            message: 'Created shipping address success!',
            metadata: await ShippingAddressService.addShippingAddress({ body: req.body })
        }).send(res)
    }
}

module.exports = ShippingAddressController