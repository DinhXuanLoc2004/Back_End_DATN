const express = require("express");
const { asyncHandler } = require("../../utils");
const OtpController = require("../../controller/otp.controller");
const router = express.Router()

router.post('/send_otp/:email', asyncHandler(OtpController.sendOtp))

module.exports = router