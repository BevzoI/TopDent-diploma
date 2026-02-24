import express from "express";
import cors from "cors";
import bodyParser from "body-parser";
import dotenv from "dotenv";
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

dotenv.config();

const app = express();

// 🔥 Render ОБОВʼЯЗКОВО використовує process.env.PORT
const PORT = process.env.PORT || 5000;

// 🔌 DB
await connectDB();

// 🔧 Middleware
app.use(cors());
app.use(bodyParser.json({ limit: "10mb" }));
app.use(bodyParser.urlencoded({ extended: true, limit: "10mb" }));

// 🟢 Health check
app.get("/", (req, res) => {
  res.send("API is running 🚀");
});

// 🔹 ROUTES
app.use("/news", newsRouters);
app.use("/auth", authRouters);
app.use("/users", usersRouters);
app.use("/weekend", weekendRouters);
app.use("/poll", pollRouters);
app.use("/events", eventRoutes);
app.use("/courses", courseRoutes);
app.use("/chat", chatRoutes);
app.use("/groups", groupsRoutes);

// 🚀 START SERVER (Render потребує це ОБОВʼЯЗКОВО)
app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});

export default app;