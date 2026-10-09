import mongoose from "mongoose";

const hospitalSchema = new mongoose.Schema({
  name:{
    type:String,
    reuired:true,
    trim:true
  },
  address:{
    type:String,
    reuired:true,
    trim:true
  },
  city:{
    type:String,
    reuired:true,
    trim:true
  },
  state:{
    type:String,
    reuired:true,
    trim:true
  },
  pinode:{
    type:String,
    reuired:true,
    trim:true
  },
  phone:{
    type:String,
    trim:true
  },
  email:{
    type:String,
    lowercase:true,
    trim:true
  },
  specialties:[{
    type:String,
    trim:true
  },],
  dicription:{
    type:String,
    trim:true
  },
  averageRating:{
    type:Number,
    default:0,
    min:0,
    max:5
  },
  totalReviews:{
    type: Number,
    default:0,
    min:0
  },
  isVerified:{
    type:Boolean,
    default:false,
  }
},{timestamps:true})

const Hospital = mongoose.model("Hospital",hospitalSchema);

export default Hospital;