const { ConflictRequestError } = require("../core/error.reponse")
const { image_product_colorModel } = require("../models/image_product_color.model")
const { selectFilesData } = require("../utils")

class ImageProductColorService {
    static addImageProductColor = async ({ body }) => {
        const { image, color_id } = body
        const newImageProductColor = await image_product_colorModel.create({
            color_id,
            url: image.url,
            public_id: image.public_id
        })
        if (!newImageProductColor) throw new ConflictRequestError('Error create newImageProductColor')
        return {
            newImageProductColor: selectFilesData({ fileds: ['_id', 'url', 'public_id', 'color_id'], object: newImageProductColor })
        }
    }
}

module.exports = ImageProductColorService