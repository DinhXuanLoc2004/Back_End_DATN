const express = require('express')
const { asyncHandler } = require('../utils')
const TokenController = require('../controller/token.controller')
const router = express.Router()

router.post('/ref_accessToken', asyncHandler(TokenController.ref_accessToken))

module.exports = router