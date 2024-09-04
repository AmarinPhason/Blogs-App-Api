import { AppError } from "../middlewares/errorHandler.js";
import { Post } from "../models/postModel.js";
import { getDataUri } from "../utils/feature.js";
import path from "path";
import cloudinary from "cloudinary";

// Create Post
export const postCtrl = async (req, res, next) => {
  const user = req.user.id;
  const username = req.user.username;
  const { title, content } = req.body;

  try {
    if (!title || !content) {
      return next(new AppError("All fields required", 400));
    }

    let newPost = new Post({
      title,
      content,
      author: user,
    });

    // ตรวจสอบและอัปโหลดหลายไฟล์
    if (req.files && req.files.length > 0) {
      newPost.files = []; // สร้างอาเรย์สำหรับเก็บข้อมูลไฟล์

      for (const file of req.files) {
        const fileUri = getDataUri(file);

        const publicId = `users/${username}/${
          file.mimetype.startsWith("image/") ? "images" : "videos"
        }/${path.parse(file.originalname).name}`;

        const cdb = await cloudinary.v2.uploader.upload(fileUri.content, {
          public_id: publicId,
          resource_type: file.mimetype.startsWith("image/") ? "image" : "video",
          overwrite: true,
        });

        // เก็บข้อมูลไฟล์ที่อัปโหลดลงในอาเรย์
        newPost.files.push({
          public_id: cdb.public_id,
          url: cdb.secure_url,
          resource_type: file.mimetype.startsWith("image/") ? "image" : "video",
        });
      }
    }

    await newPost.save();
    newPost = await newPost.populate("author", "username");

    res.status(201).json({
      message: "Post created successfully",
      data: newPost,
    });
  } catch (error) {
    next(error);
  }
};

// Get All My Post
export const getAllMyPostCtrl = async (req, res, next) => {
  try {
    const posts = await Post.find({ author: req.user.id }).populate(
      "author",
      "username"
    );
    res.status(200).json({
      message: "Posts fetched successfully",
      data: posts,
    });
  } catch (error) {
    next(error);
  }
};

// Edit Post
export const editPostCtrl = async (req, res, next) => {
  const { id } = req.params;
  const { title, content } = req.body;

  try {
    let post = await Post.findById(id);
    if (!post) {
      return next(new AppError("Post not found", 404));
    }

    if (post.author.toString() !== req.user.id) {
      return next(
        new AppError("You are not authorized to edit this post", 401)
      );
    }

    // อัปเดต title และ content
    post.title = title;
    post.content = content;

    // ตรวจสอบและอัปเดตรูปภาพหรือวิดีโอ
    if (req.files && req.files.length > 0) {
      for (const file of req.files) {
        const fileUri = getDataUri(file);
        const publicId = `users/${req.user.username}/${
          file.mimetype.startsWith("image/") ? "images" : "videos"
        }/${path.parse(file.originalname).name}`;

        // ลบไฟล์เก่าจาก Cloudinary ถ้ามี
        if (post.files && post.files.length > 0) {
          for (const oldFile of post.files) {
            await cloudinary.v2.uploader.destroy(oldFile.public_id, {
              resource_type: oldFile.resource_type,
            });
          }
        }

        // อัปโหลดไฟล์ใหม่ไปยัง Cloudinary
        const cdb = await cloudinary.v2.uploader.upload(fileUri.content, {
          public_id: publicId,
          resource_type: file.mimetype.startsWith("image/") ? "image" : "video",
          overwrite: true,
        });

        // อัปเดตข้อมูลไฟล์ในโพสต์
        post.files = [
          {
            public_id: cdb.public_id,
            url: cdb.secure_url,
            resource_type: file.mimetype.startsWith("image/")
              ? "image"
              : "video",
          },
        ];
      }
    }

    await post.save();
    post = await post.populate("author", "username");

    res.status(200).json({
      message: "Post updated successfully",
      data: post,
    });
  } catch (error) {
    next(error);
  }
};

// Delete Post
export const deletePostCtrl = async (req, res, next) => {
  const { id } = req.params;
  try {
    const post = await Post.findById(id);
    if (!post) {
      return next(new AppError("Post not found", 404));
    }

    if (post.author.toString() !== req.user.id) {
      return next(
        new AppError("You are not authorized to delete this post", 401)
      );
    } else {
      if (post.files && post.files.length > 0) {
        for (const file of post.files) {
          await cloudinary.v2.uploader.destroy(file.public_id, {
            resource_type: file.resource_type,
          });
        }
      }
      await Post.findByIdAndDelete(id);
      res.status(200).json({
        message: "Post deleted successfully",
      });
    }
  } catch (error) {
    next(error);
  }
};
