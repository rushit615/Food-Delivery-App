import { validationResult,body } from "express-validator";

const respondWithValidationErrors= (req,res,next)=>{

    const errors = validationResult(req)
    if(!errors.isEmpty()){
        return res.status(400).json({errors:errors.array()})
    }
    next()


}
export const signUpValidator = [
  body('fullName.firstName')
    .notEmpty().withMessage('firstName should not be empty')
    .isLength({ min: 3 }).withMessage('firstName should be more than 3 letters')
    .isString(),
    
  body('fullName.lastName')
    .notEmpty().withMessage('lastName should not be empty')
    .isLength({ min: 3 }).withMessage('lastName should be more than 3 letters'),

  body('email')
    .notEmpty().withMessage('email should not be empty')
    .isEmail().withMessage('email should be in format of email'),

  body('password')
    .notEmpty().withMessage('password should not be empty')
    .isLength({ min: 6 }).withMessage('password should be 6 or more letters'),

  body('mobile')
    .notEmpty().withMessage('mobile should not be empty')
    .isLength({ min: 10, max: 10 }).withMessage('mobile number should be 10 digits'),

  respondWithValidationErrors
];

export const signInValidator = [
 
  body('email')
    .notEmpty().withMessage('email should not be empty')
    .isEmail().withMessage('email should be in format of email'),

  body('password')
    .notEmpty().withMessage('password should not be empty')
    .isLength({ min: 6 }).withMessage('password should be 6 or more letters'),

  respondWithValidationErrors
];

