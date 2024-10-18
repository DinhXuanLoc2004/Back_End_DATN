const { BadRequestError, NotFoundError, AuthFailureError, ConflictRequestError } = require("../core/error.reponse")
const { otpModel } = require("../models/otp.model")
const { userModel } = require("../models/user.model")
const { hashData, selectFilesData, compareData } = require("../utils")
const OtpService = require("./otp.service")
const TokenService = require("./token.service")

class AccessService {

    static login = async ({ email, password }) => {
        const userHoder = await userModel.findOne({ email: email }).lean()
        if (!userHoder) throw new AuthFailureError('Email is incorrect!')
        const comparePassword = await compareData({ data: password, hashData: userHoder.password })
        if (!comparePassword) throw new AuthFailureError('Password is not match!')
        if (userHoder.status === 'inactive') {
            await OtpService.createAndSendOtp({ userId: userHoder._id })
        }
        const accessToken = await TokenService.generateToken({ _id: userHoder._id }, process.env.PRIVATE_KEY, '1h')
        const refreshToken = await TokenService.generateToken({ _id: userHoder._id }, process.env.PUBLIC_KEY, '30 days')
        return {
            user: selectFilesData({ fileds: ['email', 'status', '_id'], object: userHoder }),
            tokens: {
                accessToken: accessToken,
                refreshToken: refreshToken
            }
        }
    }

    static signUp = async ({ email, password }) => {
        const hoderEmail = await userModel.findOne({ email: email }).lean()
        if (hoderEmail) throw new ConflictRequestError('Email already exists!')
        const passwordHashed = await hashData(password)
        const newUser = await userModel.create({
            email: email,
            password: passwordHashed
        })
        if (!newUser) throw new ConflictRequestError('Error, unable to register account')
        return {
            newUser: selectFilesData({ fileds: ['email', 'status'], object: newUser }),
            newOtp: await OtpService.createAndSendOtp({ userId: newUser._id })
        }
    }

    static sendOtp = async ({ body }) => {
        const { email } = body
        const hoderUser = await userModel.findOne({ email }).lean()
        if (!hoderUser) throw new NotFoundError('Email is not found!')
        const newOtp = await OtpService.createAndSendOtp({ userId: hoderUser._id })
        if (!newOtp) throw new ConflictRequestError('Error create otp!')
        return true
    }

    static verifyAccountOtp = async ({ body }) => {
        const { email, otp } = body
        const hoderUser = await userModel.findOne({ email: email }).lean()
        if (!hoderUser) throw new NotFoundError('Email is not found!')
        const userId = hoderUser._id
        const isVerify = await OtpService.verifyOtp({ userId, otp })
        if (isVerify) {
            const userUpdated = await userModel.findByIdAndUpdate(
                { _id: userId },
                { status: 'active' },
                { new: true }
            )
            await otpModel.findOneAndDelete({ userId })
            return selectFilesData({ fileds: ['email', 'status', '_id'], object: userUpdated })
        }
    }
}

module.exports = AccessService