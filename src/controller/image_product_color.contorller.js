const { CREATED } = require("../core/success.response")
const ImageProductColorService = require("../services/image_product_color.service")

class ImageProductColorController {
    static addImageProductColor = async (req, res, next) => {
        new CREATED({
            message: 'Created image product color success',
            metadata: await ImageProductColorService.addImageProductColor({body: req.body})
        }).send(res)
    }
}

module.exports = ImageProductColorController