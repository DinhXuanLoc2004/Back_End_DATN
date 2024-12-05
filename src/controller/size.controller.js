const { CREATED, OK } = require("../core/success.response")
const SizeService = require("../services/size.service")

class SizeController {
    static updateSize = async (req, res, next) => {
        new OK({
            message: 'Update size success!',
            metadata: await SizeService.updateSize({ query: req.query, body: req.body })
        }).send(res)
    }

    static deleteSize = async (req, res, next) => {
        new OK({
            message: 'Delete size success!',
            metadata: await SizeService.deleteSize({ query: req.query })
        }).send(res)
    }

    static getDetailSize = async (req, res, next) => {
        new OK({
            message: 'Get detail sizes success!',
            metadata: await SizeService.getDetailSize({ query: req.query })
        }).send(res)
    }

    static getAllSize = async (req, res, next) => {
        new OK({
            message: 'Get all sizes success!',
            metadata: await SizeService.getAllSize({query: req.query})
        }).send(res)
    }

    static addSize = async (req, res, next) => {
        new CREATED({
            message: 'Create size success!',
            metadata: await SizeService.addSize({ body: req.body })
        }).send(res)
    }
}

module.exports = SizeController