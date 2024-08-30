const express = require("express");
const { asyncHandler } = require("../../utils");
const accessController = require("../../controller/access.controller");
const router = express.Router()

router.post('/signup', asyncHandler(accessController.signUp))
router.post('/login', asyncHandler(accessController.login))
router.post('/verify_otp', asyncHandler(accessController.verifyAccountOtp))

module.exports = router