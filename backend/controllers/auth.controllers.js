import genToken from "../config/token.js";
import User from "../models/user.model.js";
import bcrypt from "bcryptjs";
export const signUp= async(req,res)=>{
    try{//1- i/p details take from frontend in body
        let {firstname,lastname,username,email,password}= req.body;
        let existEmail=await User.findOne({email})
        if(existEmail){
            return res.status(400).json({message:"email already exist !"})
        }
         let existUsername=await User.findOne({username})
        if(existUsername){
            return res.status(400).json({message:"username already exist !"})
        }
        if(password.length<8){
            return res.status(400).json({message:"password must atleast of 8 length"});
        }
        //2 hash password
        let hassedPassword= await bcrypt.hash(password,10);

        //3 create user
        const user= await User.create({
            firstname,
            lastname,
            username,
            email,
            password:hassedPassword
        })
        //4 generate token on config as we need it all in login also
        let token=await genToken(user._id)//user id by default gen by mongodb
        //5 parse cookie
        res.cookie("token",token,{
            //properties
            httpOnly:true,
            maxAge:7*24*60*60*1000,
            sameSite:"strict",
            secure:process.env.NODE_ENVIRONMENT==="production"
        })

        //signup succesfully
          return res.status(201).json(user);

          

    }
    catch (error) {
  console.error(error); // 🔥 see real error in terminal

  res.status(500).json({
    success: false,
    message: error.message
  });
}
}



export const login=async (req,res)=>{
    try{

        //i/p details

        const{email,password}= req.body;
        let user= await User.findOne({email})
        if(!user){
            return res.status(400).json({message:"Email or password is wrong "})
        }

        //compare password

        const isMatch = await bcrypt.compare(password,user.password)

        if(!isMatch){
            return res.status(400).json({message:"password is wrong "});
        }
//generate token

        let token= await genToken(user._id);
        //parse the cookies

        res.cookie("token",token,{
            httpOnly:true,
            maxAge:7*24*60*60*1000,
            sameSite:'strict',
            secure:process.env.NODE_ENVIRONMENT==="production"
        })
        //login succesfuly

        res.status(200).json(user)




    }
    catch (error){
        console.log(error);
        return res.status(500).json({message:"login error"})

    }
}


export const logout= async(req,res)=>{
    try{
        res.clearCookie("token")
        res.status(200).json({message: "user succesfully logout"})

    }
    catch(error){
        console.log(error);
        return res.status(400).json({message:"logout error"});

    }
}