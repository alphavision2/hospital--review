import Review from "../models/review.models.js";
import Hospital from "../models/hospital.models.js";



export const createReview = async (req, res) => {
  let reviewSaved = false;

  try {
    const { rating, comment, department, visitDate } = req.body;
    const { hospitalId } = req.params;

    // Validate rating
    const numericRating = Number(rating);

    if (
      rating === undefined ||
      !Number.isInteger(numericRating) ||
      numericRating < 1 ||
      numericRating > 5
    ) {
      return res.status(400).json({
        success: false,
        message: "Rating must be a whole number from 1 to 5",
      });
    }

    // Validate comment
    if (
      typeof comment !== "string" ||
      comment.trim().length < 5 ||
      comment.trim().length > 1000
    ) {
      return res.status(400).json({
        success: false,
        message: "Comment must contain 5 to 1000 characters",
      });
    }

    // Find hospital
    const hospital = await Hospital.findById(hospitalId);

    if (!hospital) {
      return res.status(404).json({
        success: false,
        message: "Hospital not found",
      });
    }

    // Create review
    const review = await Review.create({
      user: req.user.userId,
      hospital: hospital._id,
      rating: numericRating,
      comment: comment.trim(),
      department: department?.trim() || undefined,
      ...(visitDate ? { visitDate } : {}),
    });

    reviewSaved = true;

    // Calculate average rating and total reviews
    const stats = await Review.aggregate([
      {
        $match: {
          hospital: hospital._id,
        },
      },
      {
        $group: {
          _id: "$hospital",
          averageRating: { $avg: "$rating" },
          totalReviews: { $sum: 1 },
        },
      },
    ]);

    const averageRating = Number(
      (stats[0]?.averageRating ?? 0).toFixed(2)
    );
    const totalReviews = stats[0]?.totalReviews ?? 0;

    // Update hospital statistics
    const updatedHospital = await Hospital.findByIdAndUpdate(
      hospital._id,
      {
        $set: {
          averageRating,
          totalReviews,
        },
      },
      {
        new: true,
        runValidators: true,
      }
    );

    if (!updatedHospital) {
      throw new Error("Hospital statistics could not be updated");
    }

    // Return successful response
    return res.status(201).json({
      success: true,
      message: "Review submitted successfully !!",
      review,
      hospital: {
        _id: updatedHospital._id,
        averageRating: updatedHospital.averageRating,
        totalReviews: updatedHospital.totalReviews,
      },
      hospitalRating: {
        averageRating: updatedHospital.averageRating,
        totalReviews: updatedHospital.totalReviews,
      },
    });
  } catch (error) {
    console.error("CREATE REVIEW ERROR:", error);

    if (error.name === "CastError") {
      return res.status(400).json({
        success: false,
        message: "Invalid hospital ID",
      });
    }

    // Avoid suggesting that the review was not saved if it was
    return res.status(500).json({
      success: false,
      reviewSaved,
      message: reviewSaved
        ? "Your review was saved, but the hospital rating could not be updated. Please refresh the page."
        : "Failed to submit review. Please try again.",
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
    .populate("user", "fullName")
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