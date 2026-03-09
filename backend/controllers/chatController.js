import Chat from "../models/Chat.js";
import User from "../models/User.js";
import cloudinary from "../utils/cloudinary.js";

/* =====================================================
   HELPER – kontrola přístupu
===================================================== */

function hasAccess(chat, user) {
  if (user.role === "admin") return true;

  if (chat.visibility === "all") return true;

  if (
    chat.visibility === "users" &&
    chat.specificUsers.some(
      (id) => id.toString() === user._id.toString()
    )
  ) {
    return true;
  }

  if (
    chat.visibility === "groups" &&
    chat.specificGroups.some((groupId) =>
      user.groups.some(
        (userGroup) =>
          userGroup.toString() === groupId.toString()
      )
    )
  ) {
    return true;
  }

  return false;
}

/* =====================================================
   GET ALL CHATS
===================================================== */

export async function getChats(req, res) {
  try {
    const user = req.user;

    let query = {};

    if (user.role !== "admin") {
      query = {
        publish: "show",
        $or: [
          { visibility: "all" },
          { visibility: "users", specificUsers: user._id },
          {
            visibility: "groups",
            specificGroups: { $in: user.groups || [] },
          },
        ],
      };
    }

    const chats = await Chat.find(query)
      .populate("author", "name email")
      .sort({ createdAt: -1 });

    return res.json({
      status: "success",
      data: chats,
    });
  } catch (error) {
    console.error("Chyba při načítání chatů:", error);
    return res.status(500).json({ status: "error" });
  }
}

/* =====================================================
   GET SINGLE CHAT
===================================================== */

export async function getChatById(req, res) {
  try {
    const user = req.user;

    const chat = await Chat.findById(req.params.id)
      .populate("author", "name email")
      .populate("messages.sender", "name email");

    if (!chat) {
      return res.status(404).json({ status: "error" });
    }

    if (!hasAccess(chat, user)) {
      return res.status(403).json({
        status: "error",
        message: "Nemáte přístup k tomuto chatu",
      });
    }

    return res.json({
      status: "success",
      data: chat,
    });
  } catch (error) {
    console.error("Chyba při načítání chatu:", error);
    return res.status(500).json({ status: "error" });
  }
}

/* =====================================================
   CREATE CHAT
===================================================== */

export async function createChat(req, res) {
  try {
    const user = req.user;

    const {
      title,
      publish,
      visibility,
      specificUsers,
      specificGroups,
    } = req.body;

    const chat = await Chat.create({
      title,
      publish,
      visibility,
      specificUsers: specificUsers
        ? JSON.parse(specificUsers)
        : [],
      specificGroups: specificGroups
        ? JSON.parse(specificGroups)
        : [],
      author: user._id,
      messages: [],
    });

    return res.json({
      status: "success",
      data: chat,
    });
  } catch (error) {
    console.error("Chyba při vytváření chatu:", error);
    return res.status(400).json({ status: "error" });
  }
}

/* =====================================================
   UPDATE CHAT
===================================================== */

export async function updateChat(req, res) {
  try {
    const {
      title,
      publish,
      visibility,
      specificUsers,
      specificGroups,
    } = req.body;

    const updated = await Chat.findByIdAndUpdate(
      req.params.id,
      {
        title,
        publish,
        visibility,
        specificUsers: specificUsers
          ? JSON.parse(specificUsers)
          : [],
        specificGroups: specificGroups
          ? JSON.parse(specificGroups)
          : [],
      },
      { new: true }
    );

    return res.json({
      status: "success",
      data: updated,
    });
  } catch (error) {
    console.error("Chyba při úpravě chatu:", error);
    return res.status(400).json({ status: "error" });
  }
}

/* =====================================================
   DELETE CHAT
===================================================== */

export async function deleteChat(req, res) {
  try {
    await Chat.findByIdAndDelete(req.params.id);
    return res.json({ status: "success" });
  } catch (error) {
    return res.status(500).json({ status: "error" });
  }
}

/* =====================================================
   SEND MESSAGE + FILE UPLOAD
===================================================== */

export async function sendMessage(req, res) {
  try {
    const user = req.user;
    const { content } = req.body;

    const chat = await Chat.findById(req.params.id);

    if (!chat) {
      return res.status(404).json({ status: "error" });
    }

    if (!hasAccess(chat, user)) {
      return res.status(403).json({ status: "error" });
    }

    let uploadedFiles = [];

    if (req.files && req.files.length > 0) {
      for (const file of req.files) {
        const uploadResult = await new Promise(
          (resolve, reject) => {
            const stream =
              cloudinary.uploader.upload_stream(
                {
                  resource_type: "auto",
                  folder: "chat",
                },
                (error, result) => {
                  if (error) reject(error);
                  else resolve(result);
                }
              );
            stream.end(file.buffer);
          }
        );

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

    chat.messages.push({
      content,
      sender: user._id,
      attachments: uploadedFiles,
    });

    await chat.save();

    const updated = await Chat.findById(chat._id)
      .populate("messages.sender", "name email");

    return res.json({
      status: "success",
      data: updated,
    });
  } catch (error) {
    console.error("Chyba při odesílání zprávy:", error);
    return res.status(500).json({ status: "error" });
  }
}