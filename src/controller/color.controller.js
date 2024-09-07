const { CREATED } = require("../core/success.response")
const ColorService = require("../services/color.service")

class ColorController {
    static addColor = async (req, res, next) => {
        const {hex_color, name_color} = req.body
        new CREATED({
            message: 'Create color success!',
            metadata: await ColorService.addColor({hex_color, name_color})
        }).send(res)
    }
}

module.exports = ColorController