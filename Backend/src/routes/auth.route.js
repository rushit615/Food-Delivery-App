import express from "express";
import * as authController from '../controllers/auth.controller.js'
import * as validation  from '../middlewares/validator.middleware.js'

const router = express.Router()


router.post('/signup',authController.signUp)
router.post('/signin',validation.signInValidator,authController.signIn)
router.get('/signout',authController.signOut)
router.post('/sendotp',authController.sendOtp)
router.post('/verify-otp',authController.verifyOtp)
router.post('/resetpassword',authController.resetPassword)
authRouter.post("/google-auth",authController.googleAuth)

export default router;