import Review from "../models/review.models.js";
import Hospital from "../models/hospital.models.js";


export const createReview = async(req, res)=>{
  try{
    const {rating,comment,department,visitDate} = req.body;

    const {hospitalId} = req.params;

    if(rating === undefined || !Number.isInteger(Number(rating))||Number(rating)<1 || Number(rating)>5){
      return res.status(400)
      .json({
        success:false,
        message:"Rating must be a whole number from 1 to 5"
      });
    }

    if(typeof comment !== "string" || comment.trim().length<5 || comment.trim().length>1000){
      return res.status(400)
      .json({
          success:false,
          message:"Comment must be contain 5 to 1000 charecter"
      });
    }

    const hospital = await Hospital.findById(hospitalId);

    if(!hospital){
      return res.status(404)
      .json({
        success:false,
        message:"hospital not found"
      });
    }


    const review = await Review.create({
      user:req.user.userId,
      hospital:hospitalId,
      rating:Number(rating),
      comment:comment.trim(),department,visitDate
    });


    const stats = await Review.aggregate([
      {$match:{hospital:hospital._id}},
      {
        $group:{
          _id:"$hospital",
          averageRating:{$avg:"$rating"},
          totalReviews:{$sum:1}
        },
      },
    ]);
    
    hospital.averageRating = stats[0]?.averageRating ?? 0;
    hospital.totalReviews = stats[0]?.totalReviews ?? 0;

    await hospital.save();

    return res.status(201)
    .json({
      success:true,
      message:"Review submited successfully",review,
      hospitalRating:{
        averageRating:hospital.averageRating,
        totalReviews:hospital.totalReviews
      },
    });
  }catch(error){
    console.error("create review error",error.message);

    if(error.name === "CastError"){
      return res.status(400)
      .json({
        success:false,
        message:"Invalid hospital Id"
      });
    }


    return res.status(500)
    .json({
      success:false,
      message:"failed to submit reviews"
    });
  }
};


export const getHospitalReviews = async(req, res) => {
  try{
    const {hospitalId} = req.params;

    const hospital = await Hospital.findById(hospitalId);

    if(!hospital){
      return res.status(404)
      .json({
        success:false,
        message:"hospital not found"
      });
    }

    const reviews= await Review.find({hospital:hospitalId})
    .populate("user","fullname")
    .sort({createdAt:-1});

    return res.status(200)
    .json({
      success:true,
      count:reviews.length,reviews
    });
  }catch(error){
    console.error("get reviews error", error.message);

    return res.status(500)
    .json({
      success:false,
      message:"failed to fetch reviews"
    });
  }
};