const { ConflictRequestError, NotFoundError } = require("../core/error.reponse")
const { colorModel } = require("../models/color.model")
const { selectFilesData } = require("../utils")

class ColorService {
    static addColor = async ({ hex_color, name_color }) => {

        if (!hex_color || !name_color) {
            throw new ConflictRequestError("Both hex color and name color are required.")
        }

        if (hex_color && !/^#[0-9A-Fa-f]{6}$/.test(hex_color)) {
            throw new ConflictRequestError("Invalid hex color format. Expected format: #000000")
        }
        
        if (name_color && !/^[A-Za-z]+$/.test(name_color)) {
            throw new ConflictRequestError("Invalid name color format. Only letters are allowed.")
        }

        const existingColor = await colorModel.findOne({ hex_color })
        if (existingColor) {
            throw new ConflictRequestError("Hex color already exists.")
        }

        const newColor = await colorModel.create({
            hex_color,
            name_color
        })
        if (!newColor) throw new ConflictRequestError('Error creating color')
        return {
            newColor: selectFilesData({ fileds: ["hex_color", "name_color"], object: newColor })
        }
    }

    static updateColor = async (id, { hex_color, name_color }) => {

        if (!hex_color || !name_color) {
            throw new ConflictRequestError("Both hex color and name color are required.")
        }
        
        if (hex_color && !/^#[0-9A-Fa-f]{6}$/.test(hex_color)) {
            throw new ConflictRequestError("Invalid hex color format. Expected format: #000000")
        }
        
        if (name_color && !/^[A-Za-z]+$/.test(name_color)) {
            throw new ConflictRequestError("Invalid name color format. Only letters are allowed.")
        }

        const existingColor = await colorModel.findOne({ hex_color, _id: { $ne: id } })
        if (existingColor) {
            throw new ConflictRequestError("Hex color already exists.")
        }

        const updatedColor = await colorModel.findByIdAndUpdate(
            id,
            { hex_color, name_color },
            { new: true }
        )
        if (!updatedColor) throw new NotFoundError('Color not found')
        return {
            updatedColor: selectFilesData({ fileds: ["hex_color", "name_color"], object: updatedColor })
        }
    }

    static deleteColor = async (id) => {
        const deletedColor = await colorModel.findByIdAndUpdate(
            id,
            { is_delete: true },
            { new: true }
        )
        if (!deletedColor) throw new NotFoundError('Color not found')
        return {
            message: "Color deleted successfully"
        }
    }

    static getAllColors = async () => {
        const colors = await colorModel.find({ is_delete: false })
        return{ 
            colors: colors.map(color => 
                selectFilesData({ fileds: ["_id", "hex_color", "name_color"], object: color })
            )
        };
    }
}

module.exports = ColorService
