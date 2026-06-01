import bcrypt from "bcrypt";
import jwt from "jsonwebtoken";
import userModel from "../models/userModel.js";
import transporter from "../config/nodemailer.js";

const TOKEN_EXPIRES_IN = "2d";
const COOKIE_MAX_AGE = 2 * 24 * 60 * 60 * 1000;

const setAuthCookie = (res, userId) => {
    const token = jwt.sign({ id: userId }, process.env.JWT_SECRET, { expiresIn: TOKEN_EXPIRES_IN });

    res.cookie("token", token, {
        httpOnly: true, // cookie cannot be accessed by client-side JavaScript
        secure: process.env.NODE_ENV === "production", // cookie will only be sent over HTTPS in production
        sameSite: process.env.NODE_ENV === "production" ? "none" : "strict",
        maxAge: COOKIE_MAX_AGE, // cookie will expire in 2 days
    });
};


export const register = async (req,res)=>{
    console.log("Register endpoint hit");
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
        setAuthCookie(res, newUser._id);


        //sending welcome email to the user after successful registration
        const mailOptions = {
            from: process.env.SENDER_EMAIL,
            to: email,
            subject: "Welcome to our platform!",
            text: `Hi ${newUser.name},\n\nThank you for registering on our platform. We're excited to have you on board!\n\nBest regards,\nThe Team`
        }

        // Send the email
        await transporter.sendMail(mailOptions);

        return res.status(201).json({
            message: "User registered successfully",
            success : true,
            user: {
                name: newUser.name,
                email: newUser.email,
                profileImage: newUser.profileImage,
            }
        })


    }catch(error){
        console.log(error);
        return res.status(500).json({
            message: `Error in registering user : ${error.message}`,
            success : false,
        })    
    }  
}



export const login = async (req,res)=>{
    console.log("Login endpoint hit");
    const {email,password} = req.body;

    if(!email || !password){
        return res.status(400).json({
            message: "Please fill all the fields",
            success : false,
        })

    }

    try {
        const user = await userModel.findOne({email});
        if(!user){
            return res.status(400).json({
                message: "User does not exist",
                success : false,
            })    
        }
        
        const isPasswordValid = await bcrypt.compare(password,user.password);
        if(!isPasswordValid){
            return res.status(400).json({
                message: "Invalid credentials",
                success : false,
            })    
        }

        setAuthCookie(res, user._id);

        return res.status(200).json({
            message: "Login successful",
            success : true,
            user: {
                name: user.name,
                email: user.email,
                profileImage: user.profileImage,
            }
        })
    } catch (error) {
        console.log(error);
        return res.status(500).json({
            message: `Error in login user : ${error.message}`,
            success : false,
        })
    }
}


export const logout = async (req,res)=>{
    console.log("Logout endpoint hit");
    try {
        res.clearCookie("token", {
            httpOnly: true,
            secure: process.env.NODE_ENV === "production",
            sameSite: process.env.NODE_ENV === "production" ? "none" : "strict",
        });
        return res.status(200).json({
            message: "Logout successful",
            success : true,
        })
    } catch (error) {
        console.log(error);
        return res.status(500).json({
            message: `Error in logout user : ${error.message}`,
            success : false,
        })
    }
}


export const sendVerifyOtp = async (req,res)=>{
        console.log("Send Verify OTP endpoint hit");

        try {

            const {userId} = req.body;
            
            if(!userId){
                return res.status(400).json({
                    message: "Please provide user ID",
                    success : false,
                })
            }

            const user = await userModel.findById(userId);

            if(!user){
                return res.status(400).json({
                    message: "User does not exist",
                    success : false,
                })    
            }

            if(user.isAccountVerified){
                return res.status(400).json({
                    message: "Account is already verified",
                    success : false,
                })    
            }

            const otp = String(Math.floor(100000 + Math.random() * 900000)); // Generate a 6-digit OTP

            user.verifyOtp = otp;
            user.otpExpiry = Date.now() + 10 * 60 * 1000; // OTP expires in 10 minutes
            await user.save();
            
            const mailOptions = {
                from: process.env.SENDER_EMAIL,
                to: user.email,
                subject: "Your OTP for Account Verification",
                text: `Hi ${user.name},\n\nYour OTP for account verification is: ${otp}\n\nThis OTP will expire in 10 minutes.\n\nBest regards,\nThe Team`
            }

            await transporter.sendMail(mailOptions);
            
            return res.status(200).json({
                message: "OTP sent successfully",
                success : true,
            })

            
        } catch (error) {
            res.status(500).json({
                message: `Error in sending OTP : ${error.message}`,
                success : false,
            })
        }
}


export const verifyOtp = async (req,res)=>{
    console.log("Verify OTP endpoint hit");

    try {
        const {userId, otp} = req.body;

        if(!userId || !otp){
            return res.status(400).json({
                message: "Please provide user ID and OTP",
                success : false,
            })
        }

        const user = await userModel.findById(userId);

        if(!user){
            return res.status(400).json({
                message: "User does not exist",
                success : false,
            })    
        }

        if(user.isAccountVerified){
            return res.status(400).json({
                message: "Account is already verified",
                success : false,
            })    
        }

        if(user.verifyOtp !== otp || Date.now() > user.verifyOtpExpireAt){
            return res.status(400).json({
                message: "Invalid or expired OTP",
                success : false,
            })    
        }

        user.isAccountVerified = true;
        user.verifyOtp = '';
        user.verifyOtpExpireAt = 0;
        await user.save();

        return res.status(200).json({
            message: "Account verified successfully",
            success : true,
        })
        
    } catch (error) {
        res.status(500).json({
            message: `Error in verifying OTP : ${error.message}`,
            success : false,
        })
    }
}