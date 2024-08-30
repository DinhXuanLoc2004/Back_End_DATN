const { BadRequestError, NotFoundError, AuthFailureError } = require("../core/error.reponse")
const otpModel = require("../models/otp.model")
const userModel = require("../models/user.model")
const usersModel = require("../models/user.model")
const { hashData, selectFilesData, compareData } = require("../utils")
const OtpService = require("./otp.service")
const TokenService = require("./token.service")

class AccessService {

    static login = async ({ email, password }) => {
        const userHoder = await userModel.findOne({ email }).lean()
        if (!userHoder) throw new AuthFailureError('Email is incorrect!')
        const comparePassword = await compareData({ data: password, hashData: userHoder.password })
        if (!comparePassword) throw new AuthFailureError('Password is not match!')
        // Tạo hai loại accessToken và refreshToken để trả về cho phía FE
        const accessToken = await TokenService.generateToken({ _id: userHoder._id }, process.env.PRIVATE_KEY, '1h')
        const refreshToken = await TokenService.generateToken({ _id: userHoder._id }, process.env.PUBLIC_KEY, '30 days')
        return {
            user: {
                _id: userHoder._id,
                email: userHoder.email,
                status: userHoder.status
            },
            tokens: {
                accessToken: accessToken,
                refreshToken: refreshToken
            }
        }
    }

    static verifyAccountOtp = async ({ email, otp }) => {
        const hoderUser = await usersModel.findOne({ email: email }).lean()
        if (!hoderUser) throw new NotFoundError('Email is not found!')
        const userId = hoderUser._id
        const isVerify = await OtpService.verifyOtp({ userId, otp })
        if (isVerify) {
            await usersModel.findByIdAndUpdate(
                { _id: userId },
                { status: 'active' },
                { new: true }
            )
            await otpModel.findOneAndDelete({ userId })
            return {
                userVerify: selectFilesData({ fileds: ['email', 'status'], object: hoderUser })
            }
        }
    }
    static signUp = async ({ email, password }) => {
        const hoderEmail = await usersModel.findOne({ email }).lean()
        if (hoderEmail) throw new BadRequestError('Email already registered!')
        const passwordHashed = await hashData(password)
        const newUser = await usersModel.create({
            email: email,
            password: passwordHashed
        })
        if (newUser) {
            return {
                newUser: selectFilesData({ fileds: ['email', 'status'] }, newUser),
                newOtp: await OtpService.createAndSendOtp({ userId: newUser._id })
            }
        }
    }
}

module.exports = AccessService