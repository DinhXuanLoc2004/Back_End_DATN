const { AuthFailureError } = require("../core/error.reponse")
const TokenService = require("../services/token.service")

const authMiddleware = async (req, res, next) => {
    const accessToken = req.headers.authorization.split(' ', 1)
    if (!accessToken) throw new AuthFailureError('AccessToken Expired!')
    const verifyAccessToken = await TokenService.verifyToken(accessToken, process.env.PRIVATE_KEY, 'accessToken')
    req.JWTDecoded = verifyAccessToken
    next()
}

module.exports = authMiddleware