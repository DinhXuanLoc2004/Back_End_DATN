const express = require("express");
const router = express.Router()

const URL = '/v1/api'

router.use(`${URL}`, require('./access/index'))
router.use(`${URL}`, require('./otp/index'))

module.exports = router