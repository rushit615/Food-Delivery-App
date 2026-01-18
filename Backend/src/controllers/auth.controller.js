import userModel from "../model/user.model.js";
import bcrypt from "bcryptjs";
import genToken from "../utils/jwtToken.js";

export async function signUp(req, res) {
  try {
    const { fullName:{firstName,lastName}, email, password, mobile, role } = req.body;

    let user = await userModel.findOne({
      email,
    });

    if (user) {
      return res.status(400).json({ message: "user already exists" });
    }

    let hashedPassword = await bcrypt.hash(password, 10);
    let result = await userModel.create({
      fullName:{firstName,lastName},
      email,
      password: hashedPassword,
      mobile,
      role,
    });

    

    const token = await genToken(result._id, result.role);

    res.cookie("token", token, {
      httpOnly: true,
      maxAge: 7 * 24 * 60 * 60 *1000,
      // secure:true,
      // sameSite:'none'
    });
    return res.status(201).json({ 
      message: "signedUp successfully", 
    result,
      token
     });
 
    }
   catch (error) {
    console.error("Signup Error:", error);
    if (!res.headersSent) {
      return res.status(500).json({ message: "Internal Server Error", error: error.message });
    }
}}

export async function signIn(req,res) {

try {
  const{email,password}=req.body

  const user= await userModel.findOne({email})

  if(!user){
    return res.status(400).json({message:"User does not exist."})
  }

  const isPasswordMatch = await bcrypt.compare(password,user.password)

  if(!isPasswordMatch){
     return res.status(400).json({message:"password doesnt match."})
  }

  const token = await genToken(user._id,user.role)

res.cookie("token", token, {
      httpOnly: true,
      maxAge: 7 * 24 * 60 * 60 *1000,
      // secure:true,
      // sameSite:'none'
    });
req.user=user

return res.status(200).json(user,token)

  }

 catch (error) {
   console.error("Signup Error:", error);
    if (!res.headersSent) {
      return res.status(500).json({ message: "Internal Server Error", error: error.message });
    }
}

  
}