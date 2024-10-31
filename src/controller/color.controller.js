const { CREATED, SuccessResponse, OK } = require("../core/success.response")
const ColorService = require("../services/color.service")

class ColorController {
    static addColor = async (req, res, next) => {
        const { hex_color, name_color } = req.body
        new CREATED({
            message: 'Color created successfully!',
            metadata: await ColorService.addColor({ hex_color, name_color })
        }).send(res)
    }

    static updateColor = async (req, res, next) => {
        const { id } = req.query 
        const { hex_color, name_color } = req.body
        new SuccessResponse({
            message: 'Color updated successfully!',
            metadata: await ColorService.updateColor(id, { hex_color, name_color })
        }).send(res)
    }

    static deleteColor = async (req, res, next) => {
        const { id } = req.query 
        new SuccessResponse({
            message: 'Color deleted successfully!',
            metadata: await ColorService.deleteColor(id)
        }).send(res)
    }

    static getAllColors = async (req, res, next) => {
        new OK({
            message: 'Colors retrieved successfully!',
            metadata: await ColorService.getAllColors()
        }).send(res)
    }
}

module.exports = ColorController
