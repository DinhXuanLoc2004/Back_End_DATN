const { query } = require("express")
const { ConflictRequestError, BadRequestError } = require("../core/error.reponse")
const { colorModel } = require("../models/color.model")
const { selectFilesData, validateHexColor, selectMainFilesData } = require("../utils")

class ColorService {
    static updateColor = async ({ query, body }) => {
        const { _id } = query
        const { hex_color, name_color } = body
        if (validateHexColor(hex_color)) throw new BadRequestError('Hex color invalid!')
        const existedHexcolor = await colorModel.findOne({ hex_color, _id: { $ne: _id } }).lean()
        if (existedHexcolor) throw new BadRequestError('Hex color existed!')
        const colorUpdated = await colorModel.findByIdAndUpdate(_id,
            { hex_color, name_color }, { new: true }).lean()
        if (!colorUpdated) throw new ConflictRequestError('Conflict update color!')
        return selectMainFilesData(colorUpdated)
    }

    static deleteColor = async ({ query }) => {
        const { _id } = query
        const colorDeleted = await colorModel.findByIdAndUpdate(_id,
            { is_deleted: true }, { new: true }).lean()
        if (!colorDeleted) throw new ConflictRequestError('Conflict delete color!')
        return selectMainFilesData(colorDeleted)
    }

    static getDetailColor = async ({ query }) => {
        const { _id } = query
        const color = await colorModel.findById(_id).lean()
        return selectMainFilesData(color)
    }

    static getAllColor = async ({query}) => {
        const {is_deleted} = query
        const condition_is_deleted = is_deleted === 'true' ? true : false
        const colors = await colorModel.aggregate([
            {
                $match: {
                    is_deleted: condition_is_deleted
                }
            }, {
                $project: {
                    createdAt: 0,
                    updatedAt: 0,
                    __v: 0
                }
            }
        ])
        return colors
    }

    static addColor = async ({ body }) => {
        const { hex_color, name_color } = body
        if (validateHexColor(hex_color)) throw new BadRequestError('Hex color invalid!')
        const existingColor = await colorModel.findOne({ hex_color }).lean()
        if (existingColor) throw new BadRequestError('Hex color existed!')
        const newColor = await colorModel.create({
            hex_color,
            name_color
        })
        if (!newColor) throw new ConflictRequestError('Error create color')
        return {
            newColor: selectFilesData({ fileds: ['hex_color', 'name_color'], object: newColor })
        }
    }
}

module.exports = ColorService