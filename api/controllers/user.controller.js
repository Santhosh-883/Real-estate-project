import bcrypt from "bcrypt";
import mongoose from "mongoose";

export const getUsers = async (req, res) => {
  const { User } = req.app.locals.models;
  try {
    const users = await User.find().select("-password");
    res.status(200).json(users);
  } catch (err) {
    console.log(err);
    res.status(500).json({ message: "Failed to get users!" });
  }
};

export const getUser = async (req, res) => {
  const id = req.params.id;
  const { User } = req.app.locals.models;
  if (!mongoose.Types.ObjectId.isValid(id)) {
    return res.status(400).json({ message: "Invalid user id!" });
  }
  try {
    const user = await User.findById(id).select("-password");
    if (!user) return res.status(404).json({ message: "User not found!" });
    res.status(200).json(user);
  } catch (err) {
    console.log(err);
    res.status(500).json({ message: "Failed to get user!" });
  }
};

export const updateUser = async (req, res) => {
  const id = req.params.id;
  const tokenUserId = req.userId;
  const { password, avatar, ...inputs } = req.body;
  const { User } = req.app.locals.models;

  if (id !== tokenUserId) {
    return res.status(403).json({ message: "Not Authorized!" });
  }

  let updatedPassword = null;
  try {
    if (password) {
      updatedPassword = await bcrypt.hash(password, 10);
    }

    const updatedUser = await User.findByIdAndUpdate(
      id,
      {
        ...inputs,
        ...(updatedPassword && { password: updatedPassword }),
        ...(avatar && { avatar }),
      },
      { new: true }
    ).lean();
    if (!updatedUser) return res.status(404).json({ message: "User not found!" });

    const { password: userPassword, ...rest } = updatedUser;
    rest.id = updatedUser._id.toString();
    delete rest._id;

    res.status(200).json(rest);
  } catch (err) {
    console.log(err);
    res.status(500).json({ message: "Failed to update users!" });
  }
};

export const deleteUser = async (req, res) => {
  const id = req.params.id;
  const tokenUserId = req.userId;
  const { User, Post, SavedPost, Chat, Message } = req.app.locals.models;

  if (id !== tokenUserId) {
    return res.status(403).json({ message: "Not Authorized!" });
  }

  try {
    await SavedPost.deleteMany({ userId: id });
    await SavedPost.deleteMany({ postId: { $in: await Post.find({ userId: id }).distinct("_id") } });
    await Post.deleteMany({ userId: id });
    const chats = await Chat.find({ userIDs: id }).select("_id");
    const chatIds = chats.map((chat) => chat._id);
    if (chatIds.length) {
      await Message.deleteMany({ chatId: { $in: chatIds } });
      await Chat.deleteMany({ _id: { $in: chatIds } });
    }
    await User.findByIdAndDelete(id);
    res.status(200).json({ message: "User deleted" });
  } catch (err) {
    console.log(err);
    res.status(500).json({ message: "Failed to delete users!" });
  }
};

export const savePost = async (req, res) => {
  const postId = req.body.postId;
  const tokenUserId = req.userId;
  const { SavedPost } = req.app.locals.models;
  if (!mongoose.Types.ObjectId.isValid(postId)) {
    return res.status(400).json({ message: "Invalid post id!" });
  }

  try {
    const savedPost = await SavedPost.findOne({
      userId: tokenUserId,
      postId,
    });

    if (savedPost) {
      await SavedPost.findByIdAndDelete(savedPost.id);
      res.status(200).json({ message: "Post removed from saved list" });
    } else {
      await SavedPost.create({
        userId: tokenUserId,
        postId,
      });
      res.status(200).json({ message: "Post saved" });
    }
  } catch (err) {
    console.log(err);
    res.status(500).json({ message: "Failed to delete users!" });
  }
};

export const profilePosts = async (req, res) => {
  const tokenUserId = req.userId;
  const { Post, SavedPost } = req.app.locals.models;
  try {
    const userPosts = await Post.find({ userId: tokenUserId }).sort({
      createdAt: -1,
    });
    const saved = await SavedPost.find({ userId: tokenUserId })
      .populate("postId")
      .sort({ createdAt: -1 });

    const savedPosts = saved
      .map((item) => item.postId)
      .filter(Boolean);
    res.status(200).json({ userPosts, savedPosts });
  } catch (err) {
    console.log(err);
    res.status(500).json({ message: "Failed to get profile posts!" });
  }
};

export const getNotificationNumber = async (req, res) => {
  const tokenUserId = req.userId;
  const { Chat } = req.app.locals.models;
  try {
    const number = await Chat.countDocuments({
      userIDs: tokenUserId,
      seenBy: { $nin: [tokenUserId] },
    });
    res.status(200).json(number);
  } catch (err) {
    console.log(err);
    res.status(500).json({ message: "Failed to get profile posts!" });
  }
};
