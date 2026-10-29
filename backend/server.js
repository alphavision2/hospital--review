import express from "express";
import cors from "cors";
import dotenv from "dotenv";
import mongoose from "mongoose";
import authRoutes from "./routes/authRoutes.js";
import {protect} from "./middleware/authMiddleware.js";
import hospitalRoutes from "./routes/hospitalRoutes.js";
import reviewRoutes from "./routes/reviewRoutes.js";
import { fileURLToPath } from "node:url";
import path from "node:path";
dotenv.config();


const app = express();
let connectionPromise;


const allowedOrigins = [
  "http://localhost:5173",
  "https://hospital-review-five.vercel.app",
];

app.use(
  cors({
    origin: (origin, callback) => {
      // Allow requests without an Origin header, such as server-to-server requests.
      if (!origin) {
        return callback(null, true);
      }

      // Allow the local frontend and stable production frontend.
      if (allowedOrigins.includes(origin)) {
        return callback(null, true);
      }

      // Allow this project's generated Vercel deployment URLs.
      const isVercelDeployment =
        /^https:\/\/hospital-review-[a-z0-9-]+-vision-b3a4\.vercel\.app$/.test(
          origin
        );

      if (isVercelDeployment) {
        return callback(null, true);
      }

      return callback(new Error(`CORS blocked origin: ${origin}`));
    },
    methods: ["GET", "POST", "PUT", "PATCH", "DELETE", "OPTIONS"],
    allowedHeaders: ["Content-Type", "Authorization"],
  })
);


      
app.use(express.json());

async function connectToDatabase() {
  if (mongoose.connection.readyState === 1) return;
  if (!process.env.MONGO_URI) {
    throw new Error("MONGO_URI environment variable is required");
  }

  if (!connectionPromise) {
    connectionPromise = mongoose.connect(process.env.MONGO_URI)
      .then(() => {
        console.log("MongoDB connected:", mongoose.connection.name);
        connectionPromise = undefined;
      })
      .catch((error) => {
        connectionPromise = undefined;
        throw error;
      });
  }

  await connectionPromise;
}

app.use(async (_req, _res, next) => {
  try {
    await connectToDatabase();
    next();
  } catch (error) {
    console.error("MongoDB connection failed:", error.message);
    next(error);
  }
});

app.use("/api/hospitals",hospitalRoutes);
app.use("/api/auth",authRoutes);
app.use("/api/reviews",reviewRoutes);


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

const isStartedDirectly =
  process.argv[1] && path.resolve(process.argv[1]) === fileURLToPath(import.meta.url);

if (isStartedDirectly) {
  const PORT = process.env.PORT || 5000;
  app.listen(PORT, () => {
    console.log(`server running on port ${PORT}`);
  });
}

export default app;
