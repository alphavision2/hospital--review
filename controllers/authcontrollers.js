import bcrypt from "bcryptjs";
import User from "../models/User.models.js";

export const registerUser = async (req , res) => {
  try{
    const {fullName,email,password} = req.body;

    if(!fullName || !email || !password){
      return res.status(400)
      .json({
        success:false,
        message: "Fullname,email,password are required"
      });
    }

    if(password.length<6){
      return res.status(400)
      .json({
        success:false,
        message:"password must contain atleast 6  characters"
      })
    }

    if(typeof email !== "string"){
      return res.status(400)
      .json({
        success:false,

        message:"Email must be text value"
      })
    }
    const normalizedEmail = email.trim().toLowerCase();

    const existingUser = await User.findOne({
      email:normalizedEmail
    });

    if(existingUser){
      return res.status(409)
      .json({
        success:false,
        message:"Email id is already resistered"
      });
    }

    const hashedPassword  =await bcrypt.hash(password,12);

    const user = await User.create({
      fullName:fullName.trim(),
      email:normalizedEmail,
      password: hashedPassword
    });
    console.log("saved usser ID",user._id);
    console.log("database",User.db.name);
    console.log("collection",User.collection.name);
    
    const totalUsers = await User.countDocuments();
    console.log("Total User",totalUsers);

    return res.status(201).json({
      success:true,
      message:"User registered successfully",
      user:{
        id:user._id,
        fullName:user.fullName,
        email:user.email,
        role:user.role
      }
    });
  }
  catch(error){
    if(error.code === 11000){
      return res.status(409)
      .json({
        success:false,
        message:"email is already registered"
      });
    }

    console.error("Registration error:", error.message);

    return res.status(500)
    .json({
      success:false,
      message:"server error during regiration"
    });
  }
};