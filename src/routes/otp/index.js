const express = require("express");
const { asyncHandler } = require("../../utils");
const accessController = require("../../controller/access.controller");
const OtpController = require("../../controller/otp.controller");
const router = express.Router()

router.post('/otp/sendotp/:email', asyncHandler(OtpController.sendOtp))

module.exports = router