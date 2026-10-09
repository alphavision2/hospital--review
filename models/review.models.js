import mongoose from "mongoose";

const reviewSchema = new mongoose.Schema({
  user:{
    type:mongoose.Schema.Types.ObjectId,
    ref:"User",
    required:true
  },
  hospital:{
    type:mongoose.hospital.Types.ObjectId,
    ref:"Hospital",
    reuired:true
  },
  rating:{
    type:Number,
    reuired:true,
    min:1,
    max:5
  },
  comment:{
    type:String,
    reuired:true,
    trim:true,
    minlength: 5,
    maxlength:1000
  },
  department:{
    type:String,
    required:true,
    trim:true
  },
  visitDate:{
    type:Date
  },
  isVerified:{
    type:Boolean,
    default:false
  }
},{timestamps:true})

const Review = mongoose.model("Review",reviewSchema);

export default Review;