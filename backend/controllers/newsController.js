import News from "../models/News.js";
import User from "../models/User.js";
import cloudinary from "../utils/cloudinary.js";

/* =====================================================
   ZÍSKAT VŠECHNY ZPRÁVY
===================================================== */

export const getAllNews = async (req, res) => {
  try {
    const user = req.user;

    if (!user) {
      return res.status(401).json({
        status: "error",
        message: "Neautorizovaný přístup",
      });
    }

    let query = {};

    // Admin vidí vše
    if (user.role !== "admin") {
      query = {
        publish: "show",
        $or: [
          { visibility: "all" },
          { visibility: "users", specificUsers: user._id },
          {
            visibility: "groups",
            specificGroups: {
              $in: Array.isArray(user.groups) ? user.groups : [],
            },
          },
        ],
      };
    }

    const items = await News.find(query)
      .populate("author", "name email")
      .sort({ createdAt: -1 });

    // Reset notifikace
    await User.findByIdAndUpdate(user._id, { newNews: false });

    return res.json({
      status: "success",
      data: items,
    });

  } catch (error) {
    console.error("Chyba při načítání zpráv:", error);
    return res.status(500).json({
      status: "error",
      message: "Nepodařilo se načíst zprávy",
    });
  }
};

/* =====================================================
   ZÍSKAT JEDNU ZPRÁVU
===================================================== */

export const getOneNews = async (req, res) => {
  try {
    const item = await News.findById(req.params.id)
      .populate("author", "name email");

    if (!item) {
      return res.status(404).json({
        status: "error",
        message: "Zpráva nebyla nalezena",
      });
    }

    return res.json({
      status: "success",
      data: item,
    });

  } catch (error) {
    console.error("Chyba při načítání zprávy:", error);
    return res.status(400).json({
      status: "error",
      message: "Nepodařilo se načíst zprávu",
    });
  }
};

/* =====================================================
   VYTVOŘIT NOVOU ZPRÁVU
===================================================== */

export const createNews = async (req, res) => {
  try {
    const user = req.user;

    const {
      title,
      text,
      publish,
      visibility,
      specificUsers,
      specificGroups,
    } = req.body;

    let uploadedFiles = [];

    // Nahrávání souborů do Cloudinary
    if (req.files && req.files.length > 0) {
      for (const file of req.files) {
        const uploadResult = await new Promise((resolve, reject) => {
          const stream = cloudinary.uploader.upload_stream(
            {
              resource_type: "auto",
              folder: "news",
            },
            (error, result) => {
              if (error) reject(error);
              else resolve(result);
            }
          );
          stream.end(file.buffer);
        });

        uploadedFiles.push({
          url: uploadResult.secure_url,
          name: file.originalname,
          type:
            uploadResult.resource_type === "image"
              ? "image"
              : "file",
        });
      }
    }

    const item = await News.create({
      title,
      text,
      publish,
      visibility,
      specificUsers: specificUsers ? JSON.parse(specificUsers) : [],
      specificGroups: specificGroups ? JSON.parse(specificGroups) : [],
      attachments: uploadedFiles,
      author: user._id,
    });

    // Nastavit notifikaci všem uživatelům
    await User.updateMany({}, { $set: { newNews: true } });

    return res.status(201).json({
      status: "success",
      data: item,
    });

  } catch (error) {
    console.error("Chyba při vytváření zprávy:", error);
    return res.status(400).json({
      status: "error",
      message: "Nepodařilo se vytvořit zprávu",
    });
  }
};

/* =====================================================
   UPRAVIT ZPRÁVU
===================================================== */

export const updateNews = async (req, res) => {
  try {
    const {
      title,
      text,
      publish,
      visibility,
      specificUsers,
      specificGroups,
    } = req.body;

    let uploadedFiles = [];

    if (req.files && req.files.length > 0) {
      for (const file of req.files) {
        const uploadResult = await new Promise((resolve, reject) => {
          const stream = cloudinary.uploader.upload_stream(
            {
              resource_type: "auto",
              folder: "news",
            },
            (error, result) => {
              if (error) reject(error);
              else resolve(result);
            }
          );
          stream.end(file.buffer);
        });

        uploadedFiles.push({
          url: uploadResult.secure_url,
          name: file.originalname,
          type:
            uploadResult.resource_type === "image"
              ? "image"
              : "file",
        });
      }
    }

    const updateData = {
      title,
      text,
      publish,
      visibility,
      specificUsers: specificUsers ? JSON.parse(specificUsers) : [],
      specificGroups: specificGroups ? JSON.parse(specificGroups) : [],
    };

    if (uploadedFiles.length > 0) {
      updateData.$push = { attachments: { $each: uploadedFiles } };
    }

    const item = await News.findByIdAndUpdate(
      req.params.id,
      updateData,
      { new: true, runValidators: true }
    );

    if (!item) {
      return res.status(404).json({
        status: "error",
        message: "Zpráva nebyla nalezena",
      });
    }

    return res.json({
      status: "success",
      data: item,
    });

  } catch (error) {
    console.error("Chyba při úpravě zprávy:", error);
    return res.status(400).json({
      status: "error",
      message: "Nepodařilo se upravit zprávu",
    });
  }
};

/* =====================================================
   SMAZAT ZPRÁVU
===================================================== */

export const deleteNews = async (req, res) => {
  try {
    const deleted = await News.findByIdAndDelete(req.params.id);

    if (!deleted) {
      return res.status(404).json({
        status: "error",
        message: "Zpráva nebyla nalezena",
      });
    }

    return res.json({
      status: "success",
      data: { message: "Zpráva byla smazána" },
    });

  } catch (error) {
    console.error("Chyba při mazání zprávy:", error);
    return res.status(400).json({
      status: "error",
      message: "Nepodařilo se smazat zprávu",
    });
  }
};