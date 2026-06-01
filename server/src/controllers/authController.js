import bcrypt from "bcrypt";
import jwt from "jsonwebtoken";
import userModel from "../models/userModel.js";


export const register = async (req,res)=>{
    const {name,email,password} = req.body;

    if(!name || !email || !password){
        return res.status(400).json({
            message: "Please fill all the fields",
            success : false,
        })

    }
    try{
        // Check if user already exists
        const existingUser = await userModel.findOne({email});
        if(existingUser){
            return res.status(400).json({
                message: "User already exists",
                success : false,
            })    
        }

        const hashedPassword = await bcrypt.hash(password,10); // Hash the password with a salt round of 10
        // Create new user
        const newUser = new userModel({
            name,
            email,
            password: hashedPassword,
        })
        await newUser.save();

        //now hash password is stored in database.
        //now we will send the jwt token to the client for authentication and authorization in future requests.
        const token = jwt.sign({id:newUser._id},process.env.JWT_SECRET,{expiresIn:"2d"}); 

        res.cookie("token", token, {
            httpOnly: true, // cookie cannot be accessed by client-side JavaScript
            secure: process.env.NODE_ENV === 'production', // cookie will only be sent over HTTPS in production
            sameSite: process.env.NODE_ENV === 'production' ? 'none' : 'strict',
            maxAge: 2 * 24 * 60 * 60 * 1000, // cookie will expire in 2 days
        }) 


    }catch(error){
        console.log(error);
        return res.status(500).json({
            message: "Error in registering user",
            success : false,
        })    
    }  
}