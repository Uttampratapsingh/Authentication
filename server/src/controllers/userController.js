import userModel from "../models/userModel.js";

export const getUserData = async(req,res)=>{
    console.log("getUserData called with userId:", req.userId); // Debug log to check userId
    const userId = req.userId;

    if(!userId){
        return res.status(400).json({
            message: "User ID is missing in the request",
            success : false,
        })
    }

    try {

        const user = await userModel.findById(userId);

        if(!user){
            return res.status(404).json({
                message: "User not found",
                success : false,
            })
        }

        res.status(200).json({
            message: "User data retrieved successfully",
            success : true,
            userData : {
                name : user.name,
                email : user.email,
                profileImage : user.profileImage,
                isAccountVerified : user.isAccountVerified,

            }
        })
        
    } catch (error) {
        console.error(error);
        return res.status(500).json({
            message: "Error occurred while fetching user data",
            success : false,
        })
    }
}