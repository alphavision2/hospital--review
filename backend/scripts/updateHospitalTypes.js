
import dotenv from "dotenv";
import mongoose from "mongoose";
import Hospital from "../models/hospital.models.js";

dotenv.config();

async function migrateHospitalTypes() {
  try {
    await mongoose.connect(process.env.MONGO_URI);

    // These two records will be classified as government hospitals.
    const result = await Hospital.updateMany(
      {
        name: { $in: [/^kgmc$/i, /^rml$/i] },
      },
      {
        $set: { hospitalType: "government" },
      }
    );

    console.log("Hospital type migration completed.");
    console.log("Matched:", result.matchedCount);
    console.log("Updated:", result.modifiedCount);

    const remaining = await Hospital.countDocuments({
      hospitalType: { $exists: false },
    });

    console.log("Records still needing classification:", remaining);
  } catch (error) {
    console.error("Migration failed:", error.message);
    process.exitCode = 1;
  } finally {
    await mongoose.disconnect();
  }
}

migrateHospitalTypes();
