const express = require("express");
const { asyncHandler } = require("../../utils");
const accessController = require("../../controller/access.controller");
const router = express.Router()

router.post('/user/signup', asyncHandler(accessController.signUp))
router.post('/user/login', asyncHandler(accessController.login))
router.post('/user/verifyotp', asyncHandler(accessController.verifyAccountOtp))

module.exports = router