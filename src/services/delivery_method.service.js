const { ConflictRequestError } = require("../core/error.reponse")
const { delivery_methodModel } = require("../models/delivery_method.model")
const { selectMainFilesData } = require("../utils")

class DeliveryMethodService {
    static getDetailDeliveryMethod = async ({ query }) => {
        const { _id } = query
        const delivery_method = await delivery_methodModel.findById(_id).lean()
        return selectMainFilesData(delivery_method)
    }

    static getAllDeliveryMethod = async () => {
        const delivery_methods = await delivery_methodModel.find().lean()
        return delivery_methods.map((delivery_method) => selectMainFilesData(delivery_method))
    }

    static addDeliveryMethod = async ({ body }) => {
        const { name_delivery, delivery_fee } = body
        const newDelivery = await delivery_methodModel.create({
            name_delivery,
            delivery_fee
        })
        if (!newDelivery) throw new ConflictRequestError('Conflict create delivery mothod!')
        return selectMainFilesData(newDelivery._doc)
    }
}

module.exports = DeliveryMethodService