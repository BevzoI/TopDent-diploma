import express from "express";
import authMiddleware from "../middleware/authMiddleware.js";
import upload from "../middleware/uploadMiddleware.js";
import {
  getAlbums,
  getAlbumById,
  createAlbum,
  addPhotosToAlbum,
  deletePhoto,
  deleteAlbum,
} from "../controllers/galleryController.js";

const router = express.Router();

router.get("/", authMiddleware, getAlbums);
router.get("/:id", authMiddleware, getAlbumById);
router.post("/", authMiddleware, createAlbum);
router.post(
  "/:id/photos",
  authMiddleware,
  upload.array("photos", 20),
  addPhotosToAlbum,
);
router.delete("/:albumId/photos/:photoId", authMiddleware, deletePhoto);
router.delete("/:id", authMiddleware, deleteAlbum);

export default router;
