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
      error: error.message,
    });
  }
};

/* =====================================================
   ZÍSKAT JEDNU ZPRÁVU
===================================================== */

export const getOneNews = async (req, res) => {
  try {
    const item = await News.findById(req.params.id).populate(
      "author",
      "name email",
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
    console.error("Chyba při načítání zprávy:", error);
    return res.status(400).json({
      status: "error",
      message: "Nepodařilo se načíst zprávu",
      error: error.message,
    });
  }
};

/* =====================================================
   VYTVOŘIT NOVOU ZPRÁVU
===================================================== */

export const createNews = async (req, res) => {
  try {
    const user = req.user;

    console.log("=== CREATE NEWS START ===");
    console.log("BODY:", req.body);
    console.log(
      "FILES:",
      (req.files || []).map((f) => ({
        fieldname: f.fieldname,
        originalname: f.originalname,
        mimetype: f.mimetype,
        size: f.size,
        hasBuffer: !!f.buffer,
      })),
    );

    const { title, text, publish, visibility, specificUsers, specificGroups } =
      req.body;

    let uploadedFiles = [];

    if (req.files && req.files.length > 0) {
      for (const file of req.files) {
        console.log("Uploading file:", {
          originalname: file.originalname,
          mimetype: file.mimetype,
          size: file.size,
          hasBuffer: !!file.buffer,
        });

        const uploadResult = await new Promise((resolve, reject) => {
          const stream = cloudinary.uploader.upload_stream(
            {
              resource_type: "image",
              folder: "news",
            },
            (error, result) => {
              if (error) {
                console.error("CLOUDINARY ERROR:", error);
                reject(error);
              } else {
                resolve(result);
              }
            },
          );

          stream.end(file.buffer);
        });

        uploadedFiles.push({
          url: uploadResult.secure_url,
          name: file.originalname,
          type: "image",
        });
      }
    }

    const newsData = {
      title,
      text,
      publish: publish || "show",
      visibility: visibility || "all",
      attachments: uploadedFiles,
      author: user._id,
      specificUsers: [],
      specificGroups: [],
    };

    if (visibility === "users") {
      newsData.specificUsers = specificUsers ? JSON.parse(specificUsers) : [];
    }

    if (visibility === "groups") {
      newsData.specificGroups = specificGroups
        ? JSON.parse(specificGroups)
        : [];
    }

    const item = await News.create(newsData);

    await User.updateMany(
      { _id: { $ne: user._id } },
      { $set: { newNews: true } },
    );

    console.log("=== CREATE NEWS SUCCESS ===");

    return res.status(201).json({
      status: "success",
      data: item,
    });
  } catch (error) {
    console.error("Chyba při vytváření zprávy:", error);

    return res.status(400).json({
      status: "error",
      message: "Nepodařilo se vytvořit zprávu",
      error: error.message,
    });
  }
};

/* =====================================================
   UPRAVIT ZPRÁVU
===================================================== */

export const updateNews = async (req, res) => {
  try {
    const user = req.user;

    console.log("=== UPDATE NEWS START ===");
    console.log("BODY:", req.body);
    console.log(
      "FILES:",
      (req.files || []).map((f) => ({
        fieldname: f.fieldname,
        originalname: f.originalname,
        mimetype: f.mimetype,
        size: f.size,
        hasBuffer: !!f.buffer,
      })),
    );

    const { title, text, publish, visibility, specificUsers, specificGroups } =
      req.body;

    const item = await News.findById(req.params.id);

    if (!item) {
      return res.status(404).json({
        status: "error",
        message: "Zpráva nebyla nalezena",
      });
    }

    item.title = title;
    item.text = text;
    item.publish = publish;
    item.visibility = visibility;

    if (visibility === "users") {
      item.specificUsers = specificUsers ? JSON.parse(specificUsers) : [];
      item.specificGroups = [];
    }

    if (visibility === "groups") {
      item.specificGroups = specificGroups ? JSON.parse(specificGroups) : [];
      item.specificUsers = [];
    }

    if (visibility === "all") {
      item.specificUsers = [];
      item.specificGroups = [];
    }

    if (req.files && req.files.length > 0) {
      for (const file of req.files) {
        console.log("Uploading file:", {
          originalname: file.originalname,
          mimetype: file.mimetype,
          size: file.size,
          hasBuffer: !!file.buffer,
        });

        const uploadResult = await new Promise((resolve, reject) => {
          const stream = cloudinary.uploader.upload_stream(
            {
              resource_type: "auto",
              folder: "news",
            },
            (error, result) => {
              if (error) {
                console.error("CLOUDINARY ERROR:", error);
                reject(error);
              } else {
                resolve(result);
              }
            },
          );

          stream.end(file.buffer);
        });

        item.attachments.push({
          url: uploadResult.secure_url,
          name: file.originalname,
          type: uploadResult.resource_type === "image" ? "image" : "file",
        });
      }
    }

    await item.save();

    await User.updateMany(
      { _id: { $ne: user._id } },
      { $set: { newNews: true } },
    );

    console.log("=== UPDATE NEWS SUCCESS ===");

    return res.json({
      status: "success",
      data: item,
    });
  } catch (error) {
    console.error("Chyba při úpravě zprávy:", error);
    return res.status(400).json({
      status: "error",
      message: "Nepodařilo se upravit zprávu",
      error: error.message,
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
      error: error.message,
    });
  }
};
