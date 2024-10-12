const { CREATED } = require("../core/success.response")
const SizeService = require("../services/size.service")

class SizeController {
    static addSize = async (req, res, next) => {
        new CREATED({
            message: 'Create size success!',
            metadata: await SizeService.addSize({ body: req.body })
        }).send(res)
    }
}

module.exports = SizeController