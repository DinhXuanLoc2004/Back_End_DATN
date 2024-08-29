const { OK } = require("../core/success.response")
const userModel = require("../models/user.model")
const OtpService = require("../services/otp.service")

class OtpController {
    static sendOtp = async (req, res, next) => {
        const email = req.params.email
        const user = await userModel.findOne({ email: email })
        new OK({
            message: 'Send OTP Success!',
            metadata: await OtpService.createAndSendOtp({userId: user._id})
        }).send(res)
    }
}

module.exports = OtpController