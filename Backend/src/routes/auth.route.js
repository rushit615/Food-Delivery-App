import express from "express";
import * as authController from '../controllers/auth.controller.js'
import * as validation  from '../middlewares/validator.middleware.js'

const router = express.Router()


router.post('/signup',validation.signUpValidator,authController.signUp)
router.post('/signin',validation.signInValidator,authController.signIn)

export default router;