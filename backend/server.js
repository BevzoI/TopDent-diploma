import express from "express";
import cors from "cors";
import bodyParser from "body-parser";
import dotenv from "dotenv";
import helmet from "helmet";
import rateLimit from "express-rate-limit";
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
const PORT = process.env.PORT || 5000;

/* =======================================================
   🔌 DATABASE
======================================================= */
await connectDB();

/* =======================================================
   🛡 SECURITY HEADERS
======================================================= */
app.use(helmet());

/* =======================================================
   🚦 RATE LIMIT (ANTI-BRUTE FORCE)
======================================================= */

const authLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 хв
  max: 100, // 100 запитів на IP
  message: {
    status: "error",
    message: "Too many requests. Please try again later.",
  },
});

app.use("/auth", authLimiter);

/* =======================================================
   🔐 PRODUCTION CORS CONFIG
======================================================= */

const allowedOrigins = [
  "https://topdentteam.cz",
  "https://www.topdentteam.cz",
  "http://localhost:3000", // dev
];

app.use(
  cors({
    origin: function (origin, callback) {
      // Mobile apps / Postman (no origin header)
      if (!origin) return callback(null, true);

      if (allowedOrigins.includes(origin)) {
        callback(null, true);
      } else {
        callback(new Error("Not allowed by CORS"));
      }
    },
    credentials: true,
  })
);

/* =======================================================
   📦 BODY PARSER
======================================================= */

app.use(bodyParser.json({ limit: "10mb" }));
app.use(bodyParser.urlencoded({ extended: true, limit: "10mb" }));

/* =======================================================
   🟢 HEALTH CHECK
======================================================= */

app.get("/", (req, res) => {
  res.send("API is running 🚀");
});

/* =======================================================
   🔹 ROUTES
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
   🚀 START SERVER (Render)
======================================================= */

app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});

export default app;