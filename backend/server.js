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

// MODEL
import Chat from "./models/Chat.js";

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
];

app.use(cors({
  origin: allowedOrigins,
  credentials: true,
}));

// 🔥 ВАЖЛИВО: обробка preflight (OPTIONS)
app.options('*', cors());

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

/* =======================================================
   SOCKET.IO (REALTIME CHAT)
======================================================= */

const io = new Server(server, {
  cors: {
    origin: allowedOrigins,
    credentials: true,
  },
});

const onlineUsers = new Map(); // userId -> socketId

io.on("connection", (socket) => {
  console.log("User connected:", socket.id);

  /* ================= JOIN CHAT ================= */
  socket.on("join_chat", ({ chatId, userId }) => {
    if (!chatId || !userId) return;

    socket.join(chatId);
    socket.userId = userId;

    onlineUsers.set(userId, socket.id);

    io.emit("online_users", Array.from(onlineUsers.keys()));
  });

  /* ================= TYPING ================= */
  socket.on("typing", ({ chatId }) => {
    if (!socket.userId) return;
    socket.to(chatId).emit("typing", socket.userId);
  });

  /* ================= SEND MESSAGE ================= */
  socket.on("send_message", async ({ chatId, message }) => {
    try {
      if (!socket.userId || !chatId) return;

      const chat = await Chat.findById(chatId);
      if (!chat) return;

      const newMessage = {
        content: message?.content || null,
        image: message?.image || null,
        audio: message?.audio || null,
        attachments: message?.attachments || [],
        sender: socket.userId,
        createdAt: new Date(),
        readBy: [socket.userId],
      };

      chat.messages.push(newMessage);
      await chat.save();

      const populatedChat = await Chat.findById(chatId)
        .populate("messages.sender", "name email avatar");

      const savedMessage =
        populatedChat.messages[populatedChat.messages.length - 1];

      io.to(chatId).emit("receive_message", savedMessage);

    } catch (err) {
      console.log("Socket message error:", err);
    }
  });

  /* ================= READ RECEIPT ================= */
  socket.on("message_read", async ({ chatId, messageId }) => {
    try {
      if (!socket.userId || !chatId || !messageId) return;

      const chat = await Chat.findById(chatId);
      if (!chat) return;

      const message = chat.messages.id(messageId);
      if (!message) return;

      if (!message.readBy.includes(socket.userId)) {
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

  /* ================= DISCONNECT ================= */
  socket.on("disconnect", () => {
    console.log("User disconnected:", socket.id);

    if (socket.userId) {
      onlineUsers.delete(socket.userId);
    }

    io.emit("online_users", Array.from(onlineUsers.keys()));
  });
});

/* =======================================================
   START SERVER
======================================================= */

server.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});