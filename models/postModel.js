import mongoose from "mongoose";

const postSchema = new mongoose.Schema(
  {
    title: {
      type: String,
      required: true,
      trim: true,
    },
    content: {
      type: String,
      required: true,
    },
    author: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    files: [
      {
        public_id: { type: String },
        url: { type: String },
        resource_type: { type: String },
      },
    ],
    tags: {
      type: [String],
      default: [],
    },
  },
  {
    timestamps: true,
  }
);

export const Post = mongoose.model("Post", postSchema, "posts");
