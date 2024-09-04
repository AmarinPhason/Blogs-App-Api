import { AppError } from "../middlewares/errorHandler.js";
import { User } from "../models/userModel.js";
import bcrypt from "bcrypt";
import cloudinary from "cloudinary";
import { createSecretToken } from "../middlewares/authMiddleware.js";
import { setCookieOptions } from "../utils/cookieOptions.js";
import { getDataUri } from "../utils/feature.js";
import path from "path";

// Register
export const registerCtrl = async (req, res, next) => {
  const { username, email, password } = req.body;
  try {
    if (!username || !email || !password) {
      return next(new AppError("all fields required!", 400));
    }
    const findEmail = await User.findOne({ email });
    if (findEmail) {
      return next(new AppError("email already exists", 400));
    }
    const findUser = await User.findOne({ username });
    if (findUser) {
      return next(new AppError("username already exists", 400));
    }

    const hashPassword = await bcrypt.hash(password, 10);
    const newUser = new User({
      email,
      username,
      password: hashPassword,
    });

    await newUser.save();
    const { password: _password, ...otherDetail } = newUser._doc;
    res.status(201).json({
      message: "User created successfully",
      data: otherDetail,
    });
  } catch (error) {
    next(error);
  }
};

// Login

export const loginCtrl = async (req, res, next) => {
  const { email, password } = req.body;
  try {
    if (!email || !password) {
      return next(new AppError("all fields is required!", 400));
    }
    const findEmail = await User.findOne({ email });
    if (!findEmail) {
      return next(new AppError("email does not exist", 400));
    }
    const isMatch = await bcrypt.compare(password, findEmail.password);
    if (!isMatch) {
      return next(new AppError("Invalid password", 400));
    }
    const token = createSecretToken(findEmail._id);
    const { password: _password, ...otherDetail } = findEmail._doc;
    res.status(200).cookie("access_token", token, setCookieOptions()).json({
      message: "Login successful",
      data: otherDetail,
      token,
    });
  } catch (error) {
    next(error);
  }
};

// Get all users
export const getAllUsersCtrl = async (req, res, next) => {
  try {
    const users = await User.find();
    const { password: p, ...others } = users.map((user) => {
      const { password: p, ...others } = user._doc;
      return others;
    });
    const countDoc = await User.countDocuments();
    res.status(200).json({
      message: "Get all users successfully",
      count: countDoc,
      data: others,
    });
  } catch (error) {
    next(error);
  }
};

// Get my profile
export const getMyProfileCtrl = async (req, res, next) => {
  try {
    // เข้าถึงข้อมูลผู้ใช้จาก req.user (ที่ได้จาก authMiddleware)
    const user = await User.findById(req.user.id).select("-password");

    if (!user) {
      return next(new AppError("User not found", 404));
    }
    res.status(200).json({
      message: "Get profile successfully",
      data: user,
    });
  } catch (error) {
    next(error);
  }
};

// Logout
export const logoutCtrl = async (req, res, next) => {
  try {
    res
      .clearCookie("access_token", { path: "/" })
      .status(200)
      .json({ message: "Logout successful" });
  } catch (error) {
    next(error);
  }
};

// Update profile
export const updateProfileCtrl = async (req, res, next) => {
  try {
    const user = await User.findById(req.user.id);

    if (req.body.username && req.body.username !== user.username) {
      const existingUser = await User.findOne({ username: req.body.username });
      if (existingUser) {
        return next(new AppError("username already exists!", 400));
      }
      user.username = req.body.username;
    }
    if (req.body.oldPassword && req.body.newPassword) {
      const isMatch = await bcrypt.compare(req.body.oldPassword, user.password);
      if (!isMatch) {
        return next(new AppError("Invalid password", 400));
      }
      const hashPassword = await bcrypt.hash(req.body.newPassword, 10);
      user.password = hashPassword;
    }
    // ตรวจสอบและอัปโหลดรูปภาพ
    if (req.files && req.files.length > 0) {
      // ลบรูปโปรไฟล์เก่า ถ้ามี
      if (user.profilePicture && user.profilePicture.public_id) {
        await cloudinary.v2.uploader.destroy(user.profilePicture.public_id);
      } else {
        console.log("No previous image to delete.");
      }

      // อัปโหลดรูปโปรไฟล์ใหม่
      const file = req.files[0]; // เลือกไฟล์แรกในกรณีที่มีหลายไฟล์
      const fileUri = getDataUri(file);

      // สร้าง public_id พร้อมโฟลเดอร์เฉพาะของผู้ใช้
      const publicId = `users/${user.username}/images/${
        path.parse(file.originalname).name
      }`;

      const cdb = await cloudinary.v2.uploader.upload(fileUri.content, {
        public_id: publicId,
        resource_type: "image",
        overwrite: true,
      });

      user.profilePicture = {
        public_id: cdb.public_id,
        url: cdb.secure_url,
      };
    }

    const updatedUser = await user.save();
    const { password: _password, ...otherDetail } = updatedUser._doc;
    res.status(200).json({
      message: "update success",
      data: otherDetail,
    });
  } catch (error) {
    next(error);
  }
};
