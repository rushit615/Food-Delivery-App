import jwt from "jsonwebtoken";
import { Error } from "mongoose";

const genToken = async (userId, role) =>{
 
 try{


    const token= await jwt.sign(
  
     {
       id:userId,
       role,
     },
     process.env.JWT_SECRET,{expiresIn:"7d"}
   );
   return token;
   
 }catch(error){
 throw new Error('Error generating token')
 }
}

export default genToken;