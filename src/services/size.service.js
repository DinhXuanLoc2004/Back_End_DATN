const { ConflictRequestError, BadRequestError } = require("../core/error.reponse")
const { sizeModel } = require("../models/size.model")
const { selectFilesData, selectMainFilesData } = require("../utils")

class SizeService {
    static updateSize = async ({ query, body }) => {
        const { _id } = query
        const { size } = body
        const existedSize = await sizeModel.findOne({size, _id: {$ne: _id}}).lean()
        if(existedSize) throw new BadRequestError('Size existed!')
        const sizeUpdate = await sizeModel.findByIdAndUpdate(_id, { size }, { new: true }).lean()
        if (!sizeUpdate) throw new ConflictRequestError('Conflict update size!')
        return selectMainFilesData(sizeUpdate)
    }

    static deleteSize = async ({ query }) => {
        const { _id } = query
        const sizeDeleted = await sizeModel.findByIdAndUpdate(_id, { is_deleted: true }, { new: true }).lean()
        if (!sizeDeleted) throw new ConflictRequestError('Conflict delete size')
        return selectMainFilesData(sizeDeleted)
    }

    static getDetailSize = async ({ query }) => {
        const { _id } = query
        const size = await sizeModel.findById(_id).lean()
        return selectMainFilesData(size)
    }

    static getAllSize = async () => {
        const sizes = await sizeModel.aggregate([
            {
                $match: {
                    is_deleted: false
                }
            }, {
                $project: {
                    createdAt: 0,
                    updatedAt: 0,
                    __v: 0
                }
            }
        ])
        return sizes
    }

    static addSize = async ({ body }) => {
        const { size } = body
        const existedSize = await sizeModel.findOne({ size }).lean()
        if (existedSize) throw new BadRequestError('Size existed!')
        const newSize = await sizeModel.create({ size })
        if (!newSize) throw new ConflictRequestError('Error create size!')
        return {
            newSize: selectFilesData({ fileds: ['size'], object: newSize })
        }
    }
}

module.exports = SizeService