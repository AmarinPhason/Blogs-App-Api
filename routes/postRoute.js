import express from "express";
import { authMiddleware } from "../middlewares/authMiddleware.js";
import {
  deletePostCtrl,
  editPostCtrl,
  getAllMyPostCtrl,
  postCtrl,
} from "../controllers/postCtrl.js";
import { multiUpload } from "../utils/multer.js";
const postRouter = express.Router();
postRouter.post("/create-post", authMiddleware, multiUpload, postCtrl);
postRouter.get("/get-posts", authMiddleware, getAllMyPostCtrl);
postRouter.put("/edit-post/:id", authMiddleware, multiUpload, editPostCtrl);
postRouter.delete(
  "/delete-post/:id",
  authMiddleware,
  multiUpload,
  deletePostCtrl
);
export default postRouter;
