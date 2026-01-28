import mongoose from "mongoose";

const connectDb=async()=>{
    try{
          mongoose.connect(process.env.MONGODB_URL);
          console.log("Db connected")
    }
    catch{
        console.log("error in database")
    }
}

export default connectDb;