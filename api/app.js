import "dotenv/config";
import express from "express";
import cors from "cors";
import cookieParser from "cookie-parser";
import mongoose from "mongoose";
import authRoute from "./routes/auth.route.js";
import postRoute from "./routes/post.route.js";
import testRoute from "./routes/test.route.js";
import userRoute from "./routes/user.route.js";
import chatRoute from "./routes/chat.route.js";
import messageRoute from "./routes/message.route.js";

const app = express();
const { Schema } = mongoose;

const withIdTransform = {
  timestamps: { createdAt: true, updatedAt: false },
  toJSON: {
    versionKey: false,
    transform: (_, ret) => {
      ret.id = ret._id.toString();
      delete ret._id;
      return ret;
    },
  },
};

const userSchema = new Schema(
  {
    email: { type: String, required: true, unique: true, trim: true },
    username: { type: String, required: true, unique: true, trim: true },
    password: { type: String, required: true },
    avatar: { type: String, default: null },
  },
  withIdTransform
);

const postDetailSchema = new Schema(
  {
    desc: { type: String, required: true },
    utilities: { type: String, default: null },
    pet: { type: String, default: null },
    income: { type: String, default: null },
    size: { type: Number, default: null },
    school: { type: Number, default: null },
    bus: { type: Number, default: null },
    restaurant: { type: Number, default: null },
  },
  { _id: false }
);

const postSchema = new Schema(
  {
    title: { type: String, required: true },
    price: { type: Number, required: true },
    images: [{ type: String }],
    address: { type: String, required: true },
    city: { type: String, required: true },
    bedroom: { type: Number, required: true },
    bathroom: { type: Number, required: true },
    latitude: { type: String, required: true },
    longitude: { type: String, required: true },
    type: { type: String, enum: ["buy", "rent"], required: true },
    property: {
      type: String,
      enum: ["apartment", "house", "condo", "land"],
      required: true,
    },
    userId: { type: Schema.Types.ObjectId, ref: "User", required: true },
    postDetail: { type: postDetailSchema, required: true },
  },
  withIdTransform
);

const savedPostSchema = new Schema(
  {
    userId: { type: Schema.Types.ObjectId, ref: "User", required: true },
    postId: { type: Schema.Types.ObjectId, ref: "Post", required: true },
  },
  withIdTransform
);
savedPostSchema.index({ userId: 1, postId: 1 }, { unique: true });

const messageSchema = new Schema(
  {
    text: { type: String, required: true },
    userId: { type: String, required: true },
    chatId: { type: Schema.Types.ObjectId, ref: "Chat", required: true },
  },
  withIdTransform
);

const chatSchema = new Schema(
  {
    userIDs: [{ type: Schema.Types.ObjectId, ref: "User", required: true }],
    seenBy: [{ type: Schema.Types.ObjectId, ref: "User" }],
    lastMessage: { type: String, default: null },
  },
  withIdTransform
);

const User = mongoose.models.User || mongoose.model("User", userSchema);
const Post = mongoose.models.Post || mongoose.model("Post", postSchema);
const SavedPost =
  mongoose.models.SavedPost || mongoose.model("SavedPost", savedPostSchema);
const Chat = mongoose.models.Chat || mongoose.model("Chat", chatSchema);
const Message =
  mongoose.models.Message || mongoose.model("Message", messageSchema);

app.locals.models = { User, Post, SavedPost, Chat, Message };

if (!process.env.DATABASE_URL) {
  throw new Error("DATABASE_URL is required");
}

mongoose
  .connect(process.env.DATABASE_URL)
  .then(() => console.log("MongoDB connected"))
  .catch((error) => {
    console.error("MongoDB connection failed", error);
    process.exit(1);
  });

app.use(
  cors({
    origin: process.env.CLIENT_URL || "http://localhost:3000",
    credentials: true,
  })
);
app.use(express.json());
app.use(cookieParser());

app.get("/", (req, res) => {
  res.send("API is running!");
});

app.use("/api/auth", authRoute);
app.use("/api/users", userRoute);
app.use("/api/posts", postRoute);
app.use("/api/test", testRoute);
app.use("/api/chats", chatRoute);
app.use("/api/messages", messageRoute);

app.listen(8800, () => {
  console.log("Server is running!");
});

export default app;
