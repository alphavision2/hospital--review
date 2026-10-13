import mongoose from "mongoose";

const userSchema = new mongoose.Schema({
  fullName:{
    type:String,
    required:true,
    trim:true
  },
  email:{
    type:String,
    required:true,
    unique: true,
    lowercase:true,
    trim:true
  },
  password:{
    type:String,
    required:true,
    minLength:6
  },
  role:{
      type:String,
      required:true,
      enum:["user","admin"],
      default:"user"
  },
  
  isEmailVerified: {
    type: Boolean,
    default: false,
  },
  emailOtpHash: {
    type: String,
    default: null,
    select: false,
  },
  emailOtpExpiresAt: {
    type: Date,
    default: null,
    select: false,
  },
  emailOtpAttempts: {
    type: Number,
    default: 0,
    select: false,
  },
  emailOtpLastSentAt: {
    type: Date,
    default: null,
    select: false,
  },
  },{timestamps:true});

  const User= mongoose.model("User",userSchema);

export default User;