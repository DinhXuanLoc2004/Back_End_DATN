const otpGenerator = require("otp-generator")
const { otpModel } = require("../models/otp.model")
const { hashData, compareData, addMinutes, selectFilesData } = require("../utils")
const { NotFoundError, AuthFailureError } = require("../core/error.reponse")
const { userModel } = require('../models/user.model');
const SendMailService = require("./send_mail.service");

class OtpService {
    static createAndSendOtp = async ({ userId }) => {
        const user = await userModel.findById({ _id: userId })
        if (!user) throw new NotFoundError('Account is not found!')
        await otpModel.findOneAndDelete({ userId: userId })
        const OTP = otpGenerator.generate(4, {
            digits: true,
            lowerCaseAlphabets: false,
            upperCaseAlphabets: false,
            specialChars: false
        })
        await SendMailService.sendEmail(user.email,
            'Send OTP Code',
            `Your OTP code is: ${OTP}`,
            `<div style="font-family: Arial, sans-serif; line-height: 1.5; color: #333;">
            <h2>Your OTP Code</h2>
            <p>Dear ${user.name},</p>
            <p>Your OTP code is:</p>
            <div style="font-size: 24px; font-weight: bold; margin: 20px 0; color: #007BFF;">
                ${OTP}
            </div>
            <p>This code is valid for 5 minutes. Please do not share this code with anyone.</p>
            <p>Thank you for using our service!</p>
            <br>
            <p>Best regards,</p>
            <p>Your Company Name</p>
        </div>`)
        const otpHashed = await hashData(OTP)
        const newOTP = await otpModel.create({
            userId: userId,
            otp: otpHashed,
            endTime: addMinutes(1),
            createAt: Date.now()
        })
        if (newOTP) {
            return {
                newOTP: selectFilesData({ fileds: ['endTime', 'createAt'], object: newOTP })
            }
        }
    }

    static verifyOtp = async ({ userId, otp }) => {
        const userIdHoder = await otpModel.findOne({ userId: userId }).lean()
        if (!userIdHoder) throw new NotFoundError('This account has not been provided with an OTP!')
        const verifyOtp = await compareData({ data: otp, hashData: userIdHoder.otp })
        if (!verifyOtp) throw new AuthFailureError('OTP is incorrect!')
        if (userIdHoder && verifyOtp) {
            await otpModel.findOneAndDelete({ userId: userIdHoder._id });
            return true
        }
        return false
    }
}

module.exports = OtpService