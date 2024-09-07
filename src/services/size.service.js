const { ConflictRequestError } = require("../core/error.reponse")
const { sizeModel } = require("../models/size.model")
const { selectFilesData } = require("../utils")

class SizeService {
    static addSize = async ({ size }) => {
        const newSize = await sizeModel.create({ size })
        if (!newSize) throw new ConflictRequestError('Error create size!')
        return {
            newSize: selectFilesData({ fileds: ['size'], object: newSize })
        }
    }
}

module.exports = SizeService