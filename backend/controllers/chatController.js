import Chat from "../models/Chat.js";
import cloudinary from "../utils/cloudinary.js";

/* =====================================================
   HELPER – kontrola přístupu
===================================================== */

function hasAccess(chat, user) {
  if (!user) return false;

  if (user.role === "admin") return true;

  if (chat.publish === "hide") return false;

  if (chat.visibility === "all") return true;

  if (
    chat.visibility === "users" &&
    Array.isArray(chat.specificUsers) &&
    chat.specificUsers.some(
      (id) => id.toString() === user._id.toString()
    )
  ) {
    return true;
  }

  if (
    chat.visibility === "groups" &&
    Array.isArray(chat.specificGroups) &&
    Array.isArray(user.groups)
  ) {
    return chat.specificGroups.some((groupId) =>
      user.groups
        .map((g) => g.toString())
        .includes(groupId.toString())
    );
  }

  return false;
}

/* =====================================================
   GET ALL CHATS
===================================================== */

export async function getChats(req, res) {
  console.log("REQ.USER =", req.user);
  try {
    const user = req.user;

    const chats = await Chat.find()
      .populate("author", "name email")
      .populate("specificGroups", "name")
      .sort({ createdAt: -1 });

    const filtered = chats.filter((chat) =>
      hasAccess(chat, user)
    );

    return res.json({
      status: "success",
      data: filtered,
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
      .populate("messages.sender", "name email")
      .populate("specificGroups", "name");

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
    console.error("Chyba při mazání chatu:", error);
    return res.status(500).json({ status: "error" });
  }
}

/* =====================================================
   SEND MESSAGE + FILE UPLOAD
===================================================== */

export async function sendMessage(req, res) {
  try {
    const user = req.user;
    const { content, image, audio } = req.body;

    const chat = await Chat.findById(req.params.id);

    if (!chat) {
      return res.status(404).json({ status: "error" });
    }

    if (!hasAccess(chat, user)) {
      return res.status(403).json({ status: "error" });
    }

    let attachments = [];

    /* ================================
       1️⃣ FILE UPLOAD (multipart)
    ================================= */
    if (req.files && req.files.length > 0) {
      for (const file of req.files) {
        const uploadResult = await new Promise((resolve, reject) => {
          const stream = cloudinary.uploader.upload_stream(
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
        });

        attachments.push({
          url: uploadResult.secure_url,
          type: uploadResult.resource_type,
        });
      }
    }

    /* ================================
       2️⃣ MOBILE IMAGE URI
    ================================= */
    if (image) {
      attachments.push({
        url: image,
        type: "image",
      });
    }

    /* ================================
       3️⃣ MOBILE AUDIO URI
    ================================= */
    if (audio) {
      attachments.push({
        url: audio,
        type: "audio",
      });
    }

    /* ================================
       4️⃣ CREATE MESSAGE
    ================================= */
    const newMessage = {
      content: content || null,
      sender: user._id,
      attachments,
      createdAt: new Date(),
    };

    chat.messages.push(newMessage);
    await chat.save();

    /* ================================
       5️⃣ RETURN LAST MESSAGE POPULATED
    ================================= */
    const updatedChat = await Chat.findById(chat._id)
      .populate("messages.sender", "name email avatar");

    const lastMessage =
      updatedChat.messages[updatedChat.messages.length - 1];

    return res.json({
      status: "success",
      message: lastMessage,
    });

  } catch (error) {
    console.error("Send message error:", error);
    return res.status(500).json({ status: "error" });
  }
}