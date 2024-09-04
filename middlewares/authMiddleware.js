import jwt from "jsonwebtoken";
import { AppError } from "./errorHandler.js";
import { User } from "../models/userModel.js";

// Create secret token
export const createSecretToken = (_id) => {
  return jwt.sign({ _id }, process.env.JWT_SECRET, {
    expiresIn: "10d",
  });
};
// Auth middleware

export const authMiddleware = async (req, res, next) => {
  const token = req.cookies.access_token;

  try {
    if (!token) {
      return next(new AppError("Unauthorized", 401));
    }
    const decoded = jwt.verify(token, process.env.JWT_SECRET);

    req.user = await User.findById(decoded._id);

    if (!req.user) {
      return next(new AppError("Unauthorized", 401));
    }

    next();
  } catch (error) {
    next(error);
  }
};

// Admin middleware

export const adminMiddleware = async (req, res, next) => {
  const isAdmin = req.user.isAdmin;
  try {
    if (!isAdmin) {
      return next(new AppError("Admin access only", 401));
    }
    next();
  } catch (error) {
    next(error);
  }
};
