const { CREATED } = require("../core/success.response")
const TokenService = require("../services/token.service")

class TokenController {
    static ref_accessToken = async (req, res, next) => {
        const refreshToken = req.body.refreshToken
        new CREATED({
            message: 'Refresh accessToken Success!',
            metadata: await TokenService.ref_accessToken(refreshToken)
        }).send(res)
    }
}

module.exports = TokenController