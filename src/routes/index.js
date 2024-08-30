const express = require('express')
const router = express.Router()

const URL_CLIENT = '/api/v1/client'

router.use(`${URL_CLIENT}/user`, require('./access/auth.route'))
router.use(`${URL_CLIENT}/otp`, require('./otp/otp.route'))
router.use(`${URL_CLIENT}/token`, require('./token/token.route'))

module.exports = router