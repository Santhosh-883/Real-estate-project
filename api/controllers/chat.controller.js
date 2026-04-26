import mongoose from "mongoose";

export const getChats = async (req, res) => {
  const tokenUserId = req.userId;
  const { Chat, User } = req.app.locals.models;

  try {
    const chats = await Chat.find({ userIDs: tokenUserId })
      .sort({ createdAt: -1 })
      .lean();

    for (const chat of chats) {
      const receiverId = chat.userIDs
        .map((id) => id.toString())
        .find((id) => id !== tokenUserId);

      const receiver = await User.findById(receiverId)
        .select("username avatar")
        .lean();
      chat.id = chat._id.toString();
      delete chat._id;
      chat.receiver = receiver;
    }

    res.status(200).json(chats);
  } catch (err) {
    console.log(err);
    res.status(500).json({ message: "Failed to get chats!" });
  }
};

export const getChat = async (req, res) => {
  const tokenUserId = req.userId;
  const chatId = req.params.id;
  const { Chat, Message } = req.app.locals.models;
  if (!mongoose.Types.ObjectId.isValid(chatId)) {
    return res.status(400).json({ message: "Invalid chat id!" });
  }

  try {
    const chat = await Chat.findOne({
      _id: chatId,
      userIDs: tokenUserId,
    }).lean();

    if (!chat) return res.status(404).json({ message: "Chat not found!" });

    const messages = await Message.find({ chatId }).sort({ createdAt: 1 }).lean();

    await Chat.findByIdAndUpdate(chatId, {
      $addToSet: { seenBy: tokenUserId },
    });

    chat.id = chat._id.toString();
    delete chat._id;
    chat.messages = messages.map((message) => ({
      ...message,
      id: message._id.toString(),
      _id: undefined,
    }));
    res.status(200).json(chat);
  } catch (err) {
    console.log(err);
    res.status(500).json({ message: "Failed to get chat!" });
  }
};

export const addChat = async (req, res) => {
  const tokenUserId = req.userId;
  const { Chat } = req.app.locals.models;
  try {
    const existingChat = await Chat.findOne({
      userIDs: { $all: [tokenUserId, req.body.receiverId] },
    });

    if (existingChat) return res.status(200).json(existingChat);

    const newChat = await Chat.create({
      userIDs: [tokenUserId, req.body.receiverId],
      seenBy: [tokenUserId],
    });
    res.status(200).json(newChat);
  } catch (err) {
    console.log(err);
    res.status(500).json({ message: "Failed to add chat!" });
  }
};

export const readChat = async (req, res) => {
  const tokenUserId = req.userId;
  const chatId = req.params.id;
  const { Chat } = req.app.locals.models;
  if (!mongoose.Types.ObjectId.isValid(chatId)) {
    return res.status(400).json({ message: "Invalid chat id!" });
  }

  try {
    const chat = await Chat.findOneAndUpdate(
      { _id: chatId, userIDs: tokenUserId },
      {
        $addToSet: { seenBy: tokenUserId },
      },
      { new: true }
    );
    if (!chat) {
      return res.status(404).json({ message: "Chat not found!" });
    }
    res.status(200).json(chat);
  } catch (err) {
    console.log(err);
    res.status(500).json({ message: "Failed to read chat!" });
  }
};
