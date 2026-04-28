import express from "express";
import cors from "cors";
import bodyParser from "body-parser";
import dotenv from "dotenv";
import helmet from "helmet";
import rateLimit from "express-rate-limit";
import http from "http";
import { Server } from "socket.io";
import connectDB from "./db.js";

// ROUTES
import newsRouters from "./routes/newsRouters.js";
import authRouters from "./routes/authRouters.js";
import usersRouters from "./routes/usersRouters.js";
import weekendRouters from "./routes/weekendRouters.js";
import pollRouters from "./routes/pollRouters.js";
import eventRoutes from "./routes/eventRoutes.js";
import courseRoutes from "./routes/courseRoutes.js";
import chatRoutes from "./routes/chatRoutes.js";
import groupsRoutes from "./routes/groupsRoutes.js";
import galleryRoutes from "./routes/galleryRoutes.js";

// MODEL
import Chat from "./models/Chat.js";
import User from "./models/User.js";

dotenv.config();

const app = express();
const server = http.createServer(app);
const PORT = process.env.PORT || 5000;

/* =======================================================
   DATABASE
======================================================= */
await connectDB();

/* =======================================================
   SECURITY
======================================================= */
app.use(helmet());

const authLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 100,
  message: {
    status: "error",
    message: "Too many requests. Please try again later.",
  },
});

app.use("/auth", authLimiter);

/* =======================================================
   CORS
======================================================= */
const allowedOrigins = [
  "https://topdentteam.cz",
  "https://www.topdentteam.cz",
  "http://localhost:3000",
  "http://192.168.0.121:8081",
  "http://192.168.0.121:19006",
  "exp://192.168.0.121:8081",
];

app.use(
  cors({
    origin: allowedOrigins,
    credentials: true,
  }),
);

app.options("*", cors());

/* =======================================================
   BODY PARSER
======================================================= */
app.use(bodyParser.json({ limit: "10mb" }));
app.use(bodyParser.urlencoded({ extended: true, limit: "10mb" }));

/* =======================================================
   HEALTH CHECK
======================================================= */
app.get("/", (req, res) => {
  res.send("API is running 🚀");
});

/* =======================================================
   ROUTES
======================================================= */
app.use("/news", newsRouters);
app.use("/auth", authRouters);
app.use("/users", usersRouters);
app.use("/weekend", weekendRouters);
app.use("/poll", pollRouters);
app.use("/events", eventRoutes);
app.use("/courses", courseRoutes);
app.use("/chat", chatRoutes);
app.use("/groups", groupsRoutes);
app.use("/gallery", galleryRoutes);

/* =======================================================
   SOCKET.IO
======================================================= */
const io = new Server(server, {
  cors: {
    origin: allowedOrigins,
    credentials: true,
  },
});

const onlineUsers = new Map();

io.on("connection", (socket) => {
  console.log("User connected:", socket.id);

  socket.on("join_chat", async ({ chatId, userId }) => {
    try {
      if (!chatId || !userId) return;

      socket.join(chatId);
      socket.userId = userId.toString();

      onlineUsers.set(socket.userId, socket.id);
      io.emit("online_users", Array.from(onlineUsers.keys()));

      const chat = await Chat.findById(chatId);
      if (!chat) return;

      let changed = false;

      chat.messages.forEach((message) => {
        if (!Array.isArray(message.readBy)) {
          message.readBy = [];
        }

        const alreadyRead = message.readBy.some(
          (id) => id.toString() === socket.userId.toString(),
        );

        const senderId = message.sender?.toString?.() || "";
        const isOwnMessage = senderId === socket.userId.toString();

        if (!alreadyRead && !isOwnMessage) {
          message.readBy.push(socket.userId);
          changed = true;
        }
      });

      if (changed) {
        await chat.save();
      }
    } catch (err) {
      console.log("Join chat error:", err);
    }
  });

  socket.on("typing", ({ chatId }) => {
    if (!socket.userId || !chatId) return;
    socket.to(chatId).emit("typing", socket.userId);
  });

  socket.on("send_message", async ({ chatId, message }) => {
    try {
      if (!socket.userId || !chatId) return;

      const chat = await Chat.findById(chatId);
      if (!chat) return;

      const attachments = [];

      if (message?.attachments && Array.isArray(message.attachments)) {
        attachments.push(...message.attachments);
      }

      if (message?.image) {
        attachments.push({
          url: message.image,
          name: "image",
          type: "image",
        });
      }

      if (message?.audio) {
        attachments.push({
          url: message.audio,
          name: "audio",
          type: "audio",
        });
      }

      const newMessage = {
        content: message?.content || null,
        sender: socket.userId,
        attachments,
        createdAt: new Date(),
        readBy: [socket.userId],
        edited: false,
        isDeletedForEveryone: false,
        deletedForUsers: [],
      };

      chat.messages.push(newMessage);
      await chat.save();

      await User.updateMany({ _id: { $ne: socket.userId } }, { newChat: true });

      const populatedChat = await Chat.findById(chatId).populate(
        "messages.sender",
        "name email avatar",
      );

      const savedMessage =
        populatedChat.messages[populatedChat.messages.length - 1];

      io.to(chatId).emit("receive_message", savedMessage);
    } catch (err) {
      console.log("Socket message error:", err);
    }
  });

  socket.on("edit_message", async ({ chatId, messageId, content }) => {
    try {
      if (!socket.userId || !chatId || !messageId) return;

      const chat = await Chat.findById(chatId);
      if (!chat) return;

      const message = chat.messages.id(messageId);
      if (!message) return;

      if (String(message.sender) !== String(socket.userId)) return;
      if (message.isDeletedForEveryone) return;

      message.content = content || "";
      message.edited = true;

      await chat.save();

      const populatedChat = await Chat.findById(chatId).populate(
        "messages.sender",
        "name email avatar",
      );

      const updatedMessage = populatedChat.messages.id(messageId);

      io.to(chatId).emit("message_updated", updatedMessage);
    } catch (err) {
      console.log("Edit message error:", err);
    }
  });

  socket.on("delete_message", async ({ chatId, messageId, mode, userId }) => {
    try {
      if (!socket.userId || !chatId || !messageId) return;

      const chat = await Chat.findById(chatId);
      if (!chat) return;

      const message = chat.messages.id(messageId);
      if (!message) return;

      if (String(message.sender) !== String(socket.userId)) return;

      if (mode === "everyone") {
        message.content = "";
        message.attachments = [];
        message.edited = false;
        message.isDeletedForEveryone = true;

        await chat.save();

        io.to(chatId).emit("message_deleted_for_everyone", {
          messageId,
        });
      } else {
        if (!Array.isArray(message.deletedForUsers)) {
          message.deletedForUsers = [];
        }

        const alreadyDeleted = message.deletedForUsers.some(
          (id) => String(id) === String(userId),
        );

        if (!alreadyDeleted) {
          message.deletedForUsers.push(userId);
          await chat.save();
        }

        io.to(chatId).emit("message_deleted_for_me", {
          messageId,
          userId,
        });
      }
    } catch (err) {
      console.log("Delete message error:", err);
    }
  });

  socket.on("message_read", async ({ chatId, messageId }) => {
    try {
      if (!socket.userId || !chatId || !messageId) return;

      const chat = await Chat.findById(chatId);
      if (!chat) return;

      const message = chat.messages.id(messageId);
      if (!message) return;

      if (!Array.isArray(message.readBy)) {
        message.readBy = [];
      }

      const alreadyRead = message.readBy.some(
        (id) => id.toString() === socket.userId.toString(),
      );

      if (!alreadyRead) {
        message.readBy.push(socket.userId);
        await chat.save();
      }

      io.to(chatId).emit("message_read_update", {
        messageId,
        userId: socket.userId,
      });
    } catch (err) {
      console.log("Read receipt error:", err);
    }
  });

  socket.on("disconnect", () => {
    console.log("User disconnected:", socket.id);

    if (socket.userId) {
      onlineUsers.delete(socket.userId);
    }

    io.emit("online_users", Array.from(onlineUsers.keys()));
  });
});

server.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});
