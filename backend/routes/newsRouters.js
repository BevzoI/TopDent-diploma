import express from "express";
import * as news from "../controllers/newsController.js";
import authMiddleware from "../middleware/authMiddleware.js";
import { adminOnly } from "../middleware/roleMiddleware.js";
import upload from "../middleware/uploadMiddleware.js";

const router = express.Router();

/* =====================================================
   🔐 GET – pouze přihlášení uživatelé
===================================================== */

router.get("/", authMiddleware, news.getAllNews);
router.get("/:id", authMiddleware, news.getOneNews);

/* =====================================================
   👑 ADMIN – create / update s uploadem souborů
===================================================== */

// CREATE news + upload
router.post(
  "/",
  authMiddleware,
  adminOnly,
  upload.array("files", 10),
  news.createNews
);

// UPDATE news + upload
router.patch(
  "/:id",
  authMiddleware,
  adminOnly,
  upload.array("files", 10),
  news.updateNews
);

// DELETE news
router.delete(
  "/:id",
  authMiddleware,
  adminOnly,
  news.deleteNews
);

export default router;