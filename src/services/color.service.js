const { ConflictRequestError } = require("../core/error.reponse")
const { colorModel } = require("../models/color.model")
const { selectFilesData } = require("../utils")

class ColorService {
    static addColor = async ({ hex_color, name_color }) => {
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