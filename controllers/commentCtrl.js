import { AppError } from "../middlewares/errorHandler.js";
import { Comment } from "../models/commentModel.js";

// Create Comment
export const createCommentCtrl = async (req, res, next) => {
  const user = req.user.id;
  const postId = req.params.id;
  const { content } = req.body;
  try {
    if (!content) {
      return next(new AppError("All fields required", 400));
    }
    let newComment = new Comment({
      content,
      author: user,
      post: postId,
    });
    await newComment.save();
    newComment = await (
      await newComment.populate("author", "username")
    ).populate("post", "title content");
    res.status(201).json({
      message: "Comment created successfully",
      data: newComment,
    });
  } catch (error) {
    next(error);
  }
};

// Update Comment
export const updateCommentCtrl = async (req, res, next) => {
  const user = req.user.id;
  const commentId = req.params.id;
  const { content } = req.body;
  try {
    if (!content) {
      return next(new AppError("All fields required", 400));
    }
    let updatedComment = await Comment.findByIdAndUpdate(
      commentId,
      {
        content,
        author: user,
      },
      {
        new: true,
        runValidators: true,
      }
    );
    updatedComment = await updatedComment
      .populate("author", "username")
      .populate("post", "title content");
    res.status(200).json({
      message: "Comment updated successfully",
      data: updatedComment,
    });
  } catch (error) {
    next(error);
  }
};

// Delete Comment
export const deleteCommentCtrl = async (req, res, next) => {
  const user = req.user.id;
  const commentId = req.params.id;
  try {
    let deletedComment = await Comment.findByIdAndDelete(commentId);
    deletedComment = await deletedComment
      .populate("author", "username")
      .populate("post", "title content");
    res.status(200).json({
      message: "Comment deleted successfully",
      data: deletedComment,
    });
  } catch (error) {
    next(error);
  }
};
