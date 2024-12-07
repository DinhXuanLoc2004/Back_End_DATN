const express = require("express");
const { asyncHandler } = require("../utils");
const AccessController = require("../controller/access.controller");
const router = express.Router();

router.post('/signup', asyncHandler(AccessController.signUp));
router.post('/login', asyncHandler(AccessController.login));
router.post('/verify_otp', asyncHandler(AccessController.verifyAccountOtp));
router.post('/resend_otp', asyncHandler(AccessController.sendOtp));
router.post('/forgot_password', asyncHandler(AccessController.forgotPassword));
router.post('/reset_password', asyncHandler(AccessController.resetPassword));
router.post('/set_fcm_token', asyncHandler(AccessController.setFcmToken))
router.get('/get_all_users', asyncHandler(AccessController.getAllUsers))
router.put('/update_status_user', asyncHandler(AccessController.updateStatusUser))

module.exports = router;
