const { CREATED, OK } = require("../core/success.response")
const AccessService = require("../services/access.service")

class AccessController {
    static verifyAccountOtp = async (req, res, next) => {
        new OK({
            message: 'Verify OTP Success!',
            metadata: await AccessService.verifyAccountOtp({ body: req.body })
        }).send(res)
    }
    static signUp = async (req, res, next) => {
        const { email, password } = req.body
        new CREATED({
            message: 'SignUp Success!',
            metadata: await AccessService.signUp({ email, password })
        }).send(res)
    }
    static sendOtp = async (req, res, next) => {
        new CREATED({
            message: 'Create and otp success!',
            metadata: await AccessService.sendOtp({ body: req.body })
        }).send(res)
    }
    static login = async (req, res, next) => {
        const { email, password } = req.body
        new OK({
            message: 'Login Success!',
            metadata: await AccessService.login({ email, password })
        }).send(res)
    }
}

module.exports = AccessController