const JWT = require('jsonwebtoken')
const { ConflictRequestError, AuthFailureError } = require('../core/error.reponse')

class TokenService {
    static ref_accessToken = async (refreshToken) => {
        const verifyRefreshToken = await this.verifyToken(refreshToken, process.env.PUBLIC_KEY, 'refreshToken')
        const accessToken = await this.generateToken({ _id: verifyRefreshToken._id }, process.env.PRIVATE_KEY, '1h')
        return {
            accessToken: accessToken
        }
    }

    static generateToken = async (userInfo, secretSignature, tokenLife) => {
        const token = await JWT.sign(userInfo, secretSignature, { algorithm: 'HS256', expiresIn: tokenLife })
        if (!token) throw new ConflictRequestError('Generate Token Error!')
        return token
    }

    static verifyToken = async (token, secretSignature, typeToken) => {
        const TokenExpiredError = 'TokenExpiredError'
        try {
            return await JWT.verify(token, secretSignature)
        } catch (error) {
            if (error.name === TokenExpiredError) {
                throw new AuthFailureError(`${typeToken ?? 'Token'} Expired!`)
            } else {
                throw new AuthFailureError(`${typeToken ?? 'Token'} Invalid!`)
            }
        }
    }
}

module.exports = TokenService