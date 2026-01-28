import jwt from "jsonwebtoken"

const isAuth= async(req,res,next)=>{
    try{
        //take token
        let {token} =req.cookies
        if(!token){
            return res.status(400).json({message:"user dont have a token"})
        }

        //verify Browsertoken with stored token
        let verifyToken=await jwt.verify(token,process.env.JWT_SECRET);
        if(!verifyToken){
            return res.status(400).json({message:"user dont have a valid token"})
        }
        //verified token pass this id to user.controllers.js
        req.userId=verifyToken.userId
        next()
    }
    catch (error){
return res.status(500).json({message:"is auth error "})
    }
}

export default isAuth 