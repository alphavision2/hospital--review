import Hospital from "../models/hospital.models.js";

export const getHospitals = async(req, res) =>{
  try{
    const hospitals = await Hospital.find().sort({createdAt:-1});

    return res.status(200)
    .json({
      success:true,
      count:hospitals.length,
      hospitals,
    });
  }catch(error){
    console.log("get hospital error",error.message);

    return res.status(500)
    .json({
      success:false,
      message:"failed to fetch hospital"
    });
  }
};



export const createdHospital = async (req, res) => {
  try {
    const {
      name,
      hospitalType,
      address,
      city,
      state,
      pinCode,
      phone,
      email,
      specialties,
      description,
    } = req.body;

    if (!name || !hospitalType || !address || !city || !state) {
      return res.status(400).json({
        success: false,
        message:
          "Name, hospital type, address, city, and state are required.",
      });
    }

    const normalizedType = hospitalType.toLowerCase().trim();

    if (!["government", "private"].includes(normalizedType)) {
      return res.status(400).json({
        success: false,
        message: "Hospital type must be government or private.",
      });
    }

    const hospital = await Hospital.create({
      name: name.trim(),
      hospitalType: normalizedType,
      address: address.trim(),
      city: city.trim(),
      state: state.trim(),
      pinCode,
      phone,
      email,
      specialties,
      description,
    });

    return res.status(201).json({
      success: true,
      message: "Hospital added successfully.",
      hospital,
    });
  } catch (error) {
    console.error("Create hospital error:", error.message);

    return res.status(500).json({
      success: false,
      message: "Failed to add hospital.",
    });
  }
};

export const getHospitalById = async(req,res)=>{
  try{
    const hospital = await Hospital.findById(req.params.id);

    if(!hospital){
      return res.status(404)
      .json({
        success:false,
        message:"Hospital not found"
      });
    }

    return res.status(200)
    .json({
      success:true,hospital
    });
  }catch(error){
    return res.status(400)
    .json({
      success:false,
      message:"Invalid hospitalId"
    });
  }
};