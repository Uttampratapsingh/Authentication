import jwt from "jsonwebtoken";

const userAuth = (req,res,next)=>{
    const token = req.cookies.token;
    if(!token){
        return res.status(401).json({
            message: "Unauthorized access, token missing",
            success : false,
        })    
    }

    try {
        const decoded = jwt.verify(token, process.env.JWT_SECRET);
        req.userId = decoded.id;
        next();
    } catch (error) {
        console.log(error);
        return res.status(401).json({
            message: "Unauthorized access, invalid token",
            success : false,
        })    
    }
}

export default userAuth;