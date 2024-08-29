const JWT = require('jsonwebtoken')
const { ConflictRequestError } = require('../core/error.reponse')

const generateToken = async (userInfo, secretSignature, tokenLife) => { 
    const token = JWT.sign(userInfo, secretSignature, {algorithm: 'HS256', expiresIn: tokenLife})
    if (!token) throw new ConflictRequestError('Generate Token Error!')
    return token
}

/**
 * Verify ở đây hiểu đơn giản là cái token được tạo ra có đúng với cái chữ ký bí mật secretSignature trong
 * dự án hay không
 */
const verifyToken = async (token, secretSignature, ) => { 
    return JWT.verify(token, secretSignature)
}

module.exports = { generateToken, verifyToken   }