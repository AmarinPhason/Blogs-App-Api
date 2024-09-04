import { createCommentCtrl } from "../controllers/commentCtrl.js";
import express from "express";
import { authMiddleware } from "../middlewares/authMiddleware.js";

const commentRouter = express.Router();

commentRouter.post("/create-comment/:id", authMiddleware, createCommentCtrl);

export default commentRouter;
