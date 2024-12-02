const { BadRequestError, ConflictRequestError, AuthFailureError } = require("../core/error.reponse")
const { adminModel } = require("../models/admin.model")
const { hashData, compareData } = require("../utils")

class AdminService {
    static setFcmAdmin = async ({ body }) => {
        const { _id, fcm } = body
        const updatedAdmin = await adminModel.findByIdAndUpdate(_id, { fcm }, { new: true })
        return updatedAdmin
    }

    static togleIsActiveAdmin = async ({ query }) => {
        const { _id } = query
        const hoderAdmin = await adminModel.findById(_id).lean()
        const updateAdmin = await adminModel.findByIdAndUpdate(_id,
            { is_active: !hoderAdmin.is_active },
            { new: true })
        return updateAdmin
    }

    static loginAdmin = async ({ body }) => {
        const { email, passsword } = body
        const hoderAdmin = await adminModel.findOne({ email }).lean()
        if (!hoderAdmin) throw new AuthFailureError('email is incorrect')
        const comparePassword = await compareData({
            data: passsword,
            hashData: hoderAdmin.password
        })
        if (!comparePassword) throw new AuthFailureError('Password is not match!')
        if (!hoderAdmin.is_active) throw new AuthFailureError('The account is no longer active!')
        return hoderAdmin
    }

    static createAdmin = async ({ body }) => {
        const { email, passsword, role, create_by_id } = body
        const adminParent = await adminModel.findById(create_by_id).lean()
        if (adminParent.role !== 'Owner') throw new BadRequestError('Insufficient permissions to create!')
        const adminHoder = await adminModel.findOne({ email }).lean()
        if (adminHoder) throw new BadRequestError('Email already exists!')
        const hashedPassword = await hashData(passsword)
        const newAdmin = await adminModel.create({
            email,
            password: hashedPassword,
            role,
            create_by_id
        })
        if (!newAdmin) throw new ConflictRequestError('Conflict create admin!')
        return newAdmin
    }
}

module.exports = AdminService