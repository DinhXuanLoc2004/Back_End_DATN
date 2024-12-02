const { ConflictRequestError } = require("../core/error.reponse")
const { image_product_colorModel } = require("../models/image_product_color.model")
const { selectFilesData } = require("../utils")

class ImageProductColorService {
    static updateImageProductColor = async ({ body }) => {
        const { image_product_color_id, image, color_id } = body
        const updateImageProductColor = await image_product_colorModel.findByIdAndUpdate(image_product_color_id, {
            color_id,
            url: image.url,
            public_id: image.public_id
        }, { new: true })
        return updateImageProductColor
    }

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