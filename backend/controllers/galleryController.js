import GalleryAlbum from "../models/GalleryAlbum.js";
import User from "../models/User.js";
import cloudinary from "../utils/cloudinary.js";

/* =====================================================
   GET ALL ALBUMS
===================================================== */
export const getAlbums = async (req, res) => {
  try {
    const items = await GalleryAlbum.find()
      .populate("createdBy", "name email avatar")
      .populate("photos.uploadedBy", "name email avatar")
      .sort({ createdAt: -1 });

    return res.json({
      status: "success",
      data: items,
    });
  } catch (error) {
    console.error("Get albums error:", error);
    return res.status(500).json({
      status: "error",
      message: "Nepodařilo se načíst alba",
      error: error.message,
    });
  }
};

/* =====================================================
   GET ONE ALBUM
===================================================== */
export const getAlbumById = async (req, res) => {
  try {
    const item = await GalleryAlbum.findById(req.params.id)
      .populate("createdBy", "name email avatar")
      .populate("photos.uploadedBy", "name email avatar");

    if (!item) {
      return res.status(404).json({
        status: "error",
        message: "Album nebylo nalezeno",
      });
    }

    return res.json({
      status: "success",
      data: item,
    });
  } catch (error) {
    console.error("Get album error:", error);
    return res.status(500).json({
      status: "error",
      message: "Nepodařilo se načíst album",
      error: error.message,
    });
  }
};

/* =====================================================
   CREATE ALBUM
===================================================== */
export const createAlbum = async (req, res) => {
  try {
    const userId = req.user._id;
    const { title, description } = req.body;

    if (!title?.trim()) {
      return res.status(400).json({
        status: "error",
        message: "Název alba je povinný",
      });
    }

    const item = await GalleryAlbum.create({
      title: title.trim(),
      description: String(description || "").trim(),
      createdBy: userId,
      photos: [],
    });

    return res.status(201).json({
      status: "success",
      data: item,
    });
  } catch (error) {
    console.error("Create album error:", error);
    return res.status(400).json({
      status: "error",
      message: "Nepodařilo se vytvořit album",
      error: error.message,
    });
  }
};

/* =====================================================
   ADD PHOTOS TO ALBUM
===================================================== */
export const addPhotosToAlbum = async (req, res) => {
  try {
    const userId = req.user._id;
    const albumId = req.params.id;

    const album = await GalleryAlbum.findById(albumId);

    if (!album) {
      return res.status(404).json({
        status: "error",
        message: "Album nebylo nalezeno",
      });
    }

    if (!req.files || req.files.length === 0) {
      return res.status(400).json({
        status: "error",
        message: "Vyberte alespoň jednu fotografii",
      });
    }

    const uploadedPhotos = [];

    for (const file of req.files) {
      const uploadResult = await new Promise((resolve, reject) => {
        const stream = cloudinary.uploader.upload_stream(
          {
            resource_type: "image",
            folder: `gallery/${album._id}`,
          },
          (error, result) => {
            if (error) reject(error);
            else resolve(result);
          },
        );

        stream.end(file.buffer);
      });

      uploadedPhotos.push({
        url: uploadResult.secure_url,
        publicId: uploadResult.public_id,
        filename: file.originalname,
        uploadedBy: userId,
      });
    }

    album.photos.push(...uploadedPhotos);
    await album.save();

    const populated = await GalleryAlbum.findById(albumId)
      .populate("createdBy", "name email avatar")
      .populate("photos.uploadedBy", "name email avatar");

    return res.json({
      status: "success",
      data: populated,
    });
  } catch (error) {
    console.error("Add photos error:", error);
    return res.status(500).json({
      status: "error",
      message: "Nepodařilo se nahrát fotografie",
      error: error.message,
    });
  }
};

/* =====================================================
   DELETE PHOTO
===================================================== */
export const deletePhoto = async (req, res) => {
  try {
    const userId = req.user._id;
    const userRole = req.user.role;
    const { albumId, photoId } = req.params;

    const album = await GalleryAlbum.findById(albumId);

    if (!album) {
      return res.status(404).json({
        status: "error",
        message: "Album nebylo nalezeno",
      });
    }

    const photo = album.photos.id(photoId);

    if (!photo) {
      return res.status(404).json({
        status: "error",
        message: "Fotografie nebyla nalezena",
      });
    }

    const canDelete =
      userRole === "admin" ||
      photo.uploadedBy.toString() === userId.toString() ||
      album.createdBy.toString() === userId.toString();

    if (!canDelete) {
      return res.status(403).json({
        status: "error",
        message: "Nemáte oprávnění smazat tuto fotografii",
      });
    }

    if (photo.publicId) {
      await cloudinary.uploader.destroy(photo.publicId, {
        resource_type: "image",
      });
    }

    photo.deleteOne();
    await album.save();

    return res.json({
      status: "success",
      data: { message: "Fotografie byla smazána" },
    });
  } catch (error) {
    console.error("Delete photo error:", error);
    return res.status(500).json({
      status: "error",
      message: "Nepodařilo se smazat fotografii",
      error: error.message,
    });
  }
};

/* =====================================================
   DELETE ALBUM
===================================================== */
export const deleteAlbum = async (req, res) => {
  try {
    const userId = req.user._id;
    const userRole = req.user.role;
    const album = await GalleryAlbum.findById(req.params.id);

    if (!album) {
      return res.status(404).json({
        status: "error",
        message: "Album nebylo nalezeno",
      });
    }

    const canDelete =
      userRole === "admin" || album.createdBy.toString() === userId.toString();

    if (!canDelete) {
      return res.status(403).json({
        status: "error",
        message: "Nemáte oprávnění smazat toto album",
      });
    }

    for (const photo of album.photos) {
      if (photo.publicId) {
        await cloudinary.uploader.destroy(photo.publicId, {
          resource_type: "image",
        });
      }
    }

    await GalleryAlbum.findByIdAndDelete(req.params.id);

    return res.json({
      status: "success",
      data: { message: "Album bylo smazáno" },
    });
  } catch (error) {
    console.error("Delete album error:", error);
    return res.status(500).json({
      status: "error",
      message: "Nepodařilo se smazat album",
      error: error.message,
    });
  }
};
