const { CREATED, SuccessResponse, OK } = require("../core/success.response")
const SizeService = require("../services/size.service")

class SizeController {
    static addSize = async (req, res, next) => {
        new CREATED({
            message: 'Create size success!',
            metadata: await SizeService.addSize({ body: req.body })
        }).send(res)
    }

    static updateSize = async (req, res, next) => {
        const { id } = req.query  
        const body = req.body; 
        new SuccessResponse({
            message: 'Update size success!',
            metadata: await SizeService.updateSize({ id, body })
        }).send(res)
    }

    static deleteSize = async (req, res, next) => {
        const { id } = req.query  
        new SuccessResponse({
            message: 'Delete size success!',
            metadata: await SizeService.deleteSize({ id })
        }).send(res)
    }

    static getAllSizes = async (req, res, next) => {
        new OK({
            message: 'Get all sizes successfully!',
            metadata: await SizeService.getAllSizes()
        }).send(res);
    }
    
}

module.exports = SizeController