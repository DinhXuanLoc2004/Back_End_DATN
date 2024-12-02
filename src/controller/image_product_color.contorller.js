const { CREATED, OK } = require("../core/success.response")
const ImageProductColorService = require("../services/image_product_color.service")

class ImageProductColorController {
    static updateImageProductColor = async (req, res, next) => {
        new OK({
            message: 'Update image product color success!',
            metadata: await ImageProductColorService.updateImageProductColor({ body: req.body })
        }).send(res)
    }

    static addImageProductColor = async (req, res, next) => {
        new CREATED({
            message: 'Created image product color success',
            metadata: await ImageProductColorService.addImageProductColor({ body: req.body })
        }).send(res)
    }
}

module.exports = ImageProductColorController