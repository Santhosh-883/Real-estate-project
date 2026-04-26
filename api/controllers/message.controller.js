import mongoose from "mongoose";

export const addMessage = async (req, res) => {
  const tokenUserId = req.userId;
  const chatId = req.params.chatId;
  const text = req.body.text;
  const { Chat, Message } = req.app.locals.models;
  if (!mongoose.Types.ObjectId.isValid(chatId)) {
    return res.status(400).json({ message: "Invalid chat id!" });
  }

  try {
    const chat = await Chat.findOne({
      _id: chatId,
      userIDs: tokenUserId,
    });

    if (!chat) return res.status(404).json({ message: "Chat not found!" });

    const message = await Message.create({
      text,
      chatId,
      userId: tokenUserId,
    });

    await Chat.findByIdAndUpdate(chatId, {
      seenBy: [tokenUserId],
      lastMessage: text,
    });

    res.status(200).json(message);
  } catch (err) {
    console.log(err);
    res.status(500).json({ message: "Failed to add message!" });
  }
};
