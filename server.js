import express from "express";
import dotenv from "dotenv";
import cookieParser from "cookie-parser";
import morgan from "morgan";
import cloudinary from "cloudinary";
import cors from "cors";
import { connectDB } from "./db/connectDB.js";
import userRouter from "./routes/userRoute.js";
import { errorHandler, routeNotFound } from "./middlewares/errorHandler.js";
import postRouter from "./routes/postRoute.js";
import commentRouter from "./routes/commentRoute.js";
dotenv.config();
cloudinary.v2.config({
  cloud_name: process.env.CLOUDINARY_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET,
});
const corsOptions = {
  origin: "http://localhost:3000",
  methods: ["GET", "POST", "PUT", "DELETE"], // อนุญาตเฉพาะ HTTP methods ที่ระบุ
  allowedHeaders: ["Content-Type", "Authorization"], // อนุญาตเฉพาะ headers ที่ระบุ
  credentials: true, // อนุญาตให้ส่ง credentials (เช่น cookies) ข้าม origin
  optionsSuccessStatus: 200,
};
const PORT = process.env.PORT || 8080;
const app = express();
app.use(cookieParser());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(cors(corsOptions));

app.use(morgan("dev"));
app.use("/api/v1/user", userRouter);
app.use("/api/v1/post", postRouter);
app.use("/api/v1/comment", commentRouter);
// Error Handler
app.use(routeNotFound);
app.use(errorHandler);

// StartServer
const StartServer = async () => {
  try {
    await connectDB();
    app.listen(PORT, () => {
      console.log(`server in running on http://localhost:8000`);
    });
  } catch (error) {
    console.log(error);
  }
};
StartServer();
