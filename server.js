import express from "express";
import cors from "cors";
import dotenv from "dotenv";
import mongoose from "mongoose";

dotenv.config();


const app = express();

app.use(cors()); // ALLOW OUR REACT FRONTEND TO COMMUNICATE WITH THE BACKEND
app.use(express.json());


app.get("/", (req,res)=>{
  res.send("hospital review api is running!");
})

mongoose.connect(process.env.MONGO_URI)
.then(() => {
  console.log("Mongodb connect succesfully!");

const PORT = process.env.PORT||5000;

app.listen(PORT,()=>{
  console.log(`server running on port ${PORT}`);
});
})
.catch((error) => {
  console.log("mongodb connection is failed:",error);
});
