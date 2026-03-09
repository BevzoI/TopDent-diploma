import express from "express";
import * as news from "../controllers/newsController.js";
import authMiddleware from "../middleware/authMiddleware.js";
import { adminOnly } from "../middleware/roleMiddleware.js";
import upload from "../middleware/uploadMiddleware.js";

const router = express.Router();

/* =====================================================
   GET (тільки авторизовані)
===================================================== */

router.get("/", authMiddleware, news.getAllNews);
router.get("/:id", authMiddleware, news.getOneNews);

/* =====================================================
   ADMIN ONLY + FILE UPLOAD
===================================================== */

// 🔥 CREATE з файлами
router.post(
  "/",
  authMiddleware,
  adminOnly,
  upload.array("files"),   // <-- важливо
  news.createNews
);

// 🔥 UPDATE з файлами
router.patch(
  "/:id",
  authMiddleware,
  adminOnly,
  upload.array("files"),   // <-- важливо
  news.updateNews
);

// DELETE
router.delete(
  "/:id",
  authMiddleware,
  adminOnly,
  news.deleteNews
);

export default router;