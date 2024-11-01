const { CREATED, OK } = require("../core/success.response")
const ColorService = require("../services/color.service")

class ColorController {
    static updateColor = async (req, res, next) => {
        new OK({
            message: 'Update color success!',
            metadata: await ColorService.updateColor({ query: req.query, body: req.body })
        }).send(res)
    }

    static deleteColor = async (req, res, next) => {
        new OK({
            message: 'Detele color success!',
            metadata: await ColorService.deleteColor({ query: req.query })
        }).send(res)
    }

    static getDetailColor = async (req, res, next) => {
        new OK({
            message: 'Get detail color success!',
            metadata: await ColorService.getDetailColor({ query: req.query })
        }).send(res)
    }

    static getAllColor = async (req, res, next) => {
        new OK({
            message: 'Get all colors success!',
            metadata: await ColorService.getAllColor()
        }).send(res)
    }

    static addColor = async (req, res, next) => {
        new CREATED({
            message: 'Create color success!',
            metadata: await ColorService.addColor({ body: req.body })
        }).send(res)
    }
}

module.exports = ColorController