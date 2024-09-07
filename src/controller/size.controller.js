const { CREATED } = require("../core/success.response")
const SizeService = require("../services/size.service")

class SizeController {
    static addSize = async (req, res, next) => {
        const {size} = req.body
        new CREATED({
            message: 'Create size success!',
            metadata: await SizeService.addSize({size})
        }).send(res)
    }
}

module.exports = SizeController