import mongoose from "mongoose";
import { verifyAuthToken } from "../lib/jwt.js";

export const getPosts = async (req, res) => {
  const query = req.query;
  const { Post } = req.app.locals.models;
  const filters = {};

  try {
    if (query.city) filters.city = query.city;
    if (query.type) filters.type = query.type;
    if (query.property) filters.property = query.property;
    if (query.bedroom) filters.bedroom = parseInt(query.bedroom, 10);
    if (query.minPrice || query.maxPrice) {
      filters.price = {};
      if (query.minPrice) filters.price.$gte = parseInt(query.minPrice, 10);
      if (query.maxPrice) filters.price.$lte = parseInt(query.maxPrice, 10);
    }

    const posts = await Post.find(filters).sort({ createdAt: -1 });

    res.status(200).json(posts);
  } catch (err) {
    console.log(err);
    res.status(500).json({ message: "Failed to get posts" });
  }
};

export const getPost = async (req, res) => {
  const id = req.params.id;
  const { Post, User, SavedPost } = req.app.locals.models;
  if (!mongoose.Types.ObjectId.isValid(id)) {
    return res.status(400).json({ message: "Invalid post id" });
  }

  try {
    const post = await Post.findById(id).lean();
    if (!post) return res.status(404).json({ message: "Post not found" });

    const user = await User.findById(post.userId).select("username avatar").lean();
    const postWithUser = {
      ...post,
      id: post._id.toString(),
      user: user
        ? {
            id: user._id.toString(),
            username: user.username,
            avatar: user.avatar,
          }
        : null,
    };
    delete postWithUser._id;

    const token = req.cookies?.token;
    let isSaved = false;

    if (token) {
      try {
        const payload = await verifyAuthToken(token);
        const saved = await SavedPost.findOne({
          userId: payload.id,
          postId: id,
        }).lean();
        isSaved = Boolean(saved);
      } catch (_error) {
        isSaved = false;
      }
    }

    res.status(200).json({ ...postWithUser, isSaved });
  } catch (err) {
    console.log(err);
    res.status(500).json({ message: "Failed to get post" });
  }
};

export const addPost = async (req, res) => {
  const body = req.body;
  const tokenUserId = req.userId;
  const { Post } = req.app.locals.models;

  try {
    const newPost = await Post.create({
      ...body.postData,
      userId: tokenUserId,
      postDetail: body.postDetail,
    });
    res.status(200).json(newPost);
  } catch (err) {
    console.log(err);
    res.status(500).json({ message: "Failed to create post" });
  }
};

export const updatePost = async (req, res) => {
  try {
    res.status(200).json();
  } catch (err) {
    console.log(err);
    res.status(500).json({ message: "Failed to update posts" });
  }
};

export const deletePost = async (req, res) => {
  const id = req.params.id;
  const tokenUserId = req.userId;
  const { Post, SavedPost } = req.app.locals.models;
  if (!mongoose.Types.ObjectId.isValid(id)) {
    return res.status(400).json({ message: "Invalid post id" });
  }

  try {
    const post = await Post.findById(id);
    if (!post) return res.status(404).json({ message: "Post not found" });

    if (post.userId.toString() !== tokenUserId) {
      return res.status(403).json({ message: "Not Authorized!" });
    }

    await SavedPost.deleteMany({ postId: id });
    await Post.findByIdAndDelete(id);

    res.status(200).json({ message: "Post deleted" });
  } catch (err) {
    console.log(err);
    res.status(500).json({ message: "Failed to delete post" });
  }
};
