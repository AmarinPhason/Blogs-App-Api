import express from "express";
import {
  getAllUsersCtrl,
  getMyProfileCtrl,
  loginCtrl,
  logoutCtrl,
  registerCtrl,
  updateProfileCtrl,
} from "../controllers/userCtrl.js";
import { authMiddleware } from "../middlewares/authMiddleware.js";
import { multiUpload } from "../utils/multer.js";
const userRouter = express.Router();
userRouter.post("/register", registerCtrl);
userRouter.post("/login", loginCtrl);
userRouter.get("/get-all-users", authMiddleware, getAllUsersCtrl);
userRouter.get("/get-profile", authMiddleware, getMyProfileCtrl);
userRouter.post("/logout", logoutCtrl);
userRouter.put(
  "/update-profile",
  authMiddleware,
  multiUpload,
  updateProfileCtrl
);

export default userRouter;
