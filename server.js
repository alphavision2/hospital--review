import express from "express";
import cors from "cors";
import dotenv from "dotenv";
import mongoose from "mongoose";
import authRoutes from "./routes/authRoutes.js";
import {protect} from "./middleware/authMiddleware.js";
import hospitalRoutes from "./routes/hospitalRoutes.js";

dotenv.config();
console.log("current folder",process.cwd());
console.log("jwt_seceret loaded",Boolean(process.env.JWT_SECRET));


const app = express();

app.use(cors()); // ALLOW OUR REACT FRONTEND TO COMMUNICATE WITH THE BACKEND
app.use(express.json());


app.use("/api/auth",authRoutes);
app.use("/api/hospitals",hospitalRoutes);


app.get("/api/auth/profile",protect,(req,res)=>{
  res.status(200)
  .json({
    success:true,
    message:"Authentication successfully",
    user:req.user
  });
});


app.get("/", (req,res)=>{
  res.send("hospital review api is running!");
})

mongoose.connect(process.env.MONGO_URI)
.then(() => {
  console.log("Mongodb connect succesfully!");

  console.log("Database:",mongoose.connection.name);
  console.log("host:",mongoose.connection.host);

const PORT = process.env.PORT||5000;

app.listen(PORT,()=>{
  console.log(`server running on port ${PORT}`);
});
})
.catch((error) => {
  console.log("mongodb connection is failed:",error.message);
});
