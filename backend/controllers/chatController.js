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
    chat.specificUsers.some((id) => id.toString() === user._id.toString())
  ) {
    return true;
  }

  if (
    chat.visibility === "groups" &&
    Array.isArray(chat.specificGroups) &&
    Array.isArray(user.groups)
  ) {
    return chat.specificGroups.some((groupId) =>
      user.groups.map((g) => g.toString()).includes(groupId.toString()),
    );
  }

  return false;
}

/* =====================================================
   GET ALL CHATS
===================================================== */

export async function getChats(req, res) {
  try {
    const user = req.user;

    const chats = await Chat.find()
      .populate("author", "name email")
      .populate("specificGroups", "name")
      .sort({ createdAt: -1 });

    const filtered = chats.filter((chat) => hasAccess(chat, user));

    return res.json({
      status: "success",
      data: filtered,
    });
  } catch (error) {
    console.error("Chyba při načítání chatů:", error);
    return res.status(500).json({ status: "error", error: error.message });
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
      .populate("messages.sender", "name email avatar")
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

    const userId = user._id.toString();

    const sanitizedMessages = chat.messages.filter((msg) => {
      if (!Array.isArray(msg.deletedForUsers)) return true;

      return !msg.deletedForUsers.some((id) => id.toString() === userId);
    });

    const chatObj = chat.toObject();
    chatObj.messages = sanitizedMessages;

    return res.json({
      status: "success",
      data: chatObj,
    });
  } catch (error) {
    console.error("Chyba při načítání chatu:", error);
    return res.status(500).json({ status: "error", error: error.message });
  }
}

/* =====================================================
   CREATE CHAT
===================================================== */

export async function createChat(req, res) {
  try {
    const user = req.user;

    const { title, publish, visibility, specificUsers, specificGroups } =
      req.body;

    const chat = await Chat.create({
      title,
      publish,
      visibility,
      specificUsers: specificUsers ? JSON.parse(specificUsers) : [],
      specificGroups: specificGroups ? JSON.parse(specificGroups) : [],
      author: user._id,
      messages: [],
    });

    return res.json({
      status: "success",
      data: chat,
    });
  } catch (error) {
    console.error("Chyba při vytváření chatu:", error);
    return res.status(400).json({ status: "error", error: error.message });
  }
}

/* =====================================================
   UPDATE CHAT
===================================================== */

export async function updateChat(req, res) {
  try {
    const { title, publish, visibility, specificUsers, specificGroups } =
      req.body;

    const updated = await Chat.findByIdAndUpdate(
      req.params.id,
      {
        title,
        publish,
        visibility,
        specificUsers: specificUsers ? JSON.parse(specificUsers) : [],
        specificGroups: specificGroups ? JSON.parse(specificGroups) : [],
      },
      { new: true },
    );

    return res.json({
      status: "success",
      data: updated,
    });
  } catch (error) {
    console.error("Chyba při úpravě chatu:", error);
    return res.status(400).json({ status: "error", error: error.message });
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
    return res.status(500).json({ status: "error", error: error.message });
  }
}

/* =====================================================
   UPLOAD CHAT IMAGE
===================================================== */

export async function uploadChatImage(req, res) {
  try {
    if (!req.file) {
      return res.status(400).json({
        status: "error",
        message: "Image file is required.",
      });
    }

    const uploadResult = await new Promise((resolve, reject) => {
      const stream = cloudinary.uploader.upload_stream(
        {
          folder: "chat_images",
          resource_type: "image",
        },
        (error, result) => {
          if (error) reject(error);
          else resolve(result);
        },
      );

      stream.end(req.file.buffer);
    });

    return res.json({
      status: "success",
      url: uploadResult.secure_url,
    });
  } catch (error) {
    console.error("Upload chat image error:", error);
    return res.status(500).json({
      status: "error",
      message: "Failed to upload image.",
      error: error.message,
    });
  }
}

/* =====================================================
   UPLOAD CHAT AUDIO
===================================================== */

export async function uploadChatAudio(req, res) {
  try {
    if (!req.file) {
      return res.status(400).json({
        status: "error",
        message: "Audio file is required.",
      });
    }

    const uploadResult = await new Promise((resolve, reject) => {
      const stream = cloudinary.uploader.upload_stream(
        {
          folder: "chat_audio",
          resource_type: "video",
        },
        (error, result) => {
          if (error) reject(error);
          else resolve(result);
        },
      );

      stream.end(req.file.buffer);
    });

    return res.json({
      status: "success",
      url: uploadResult.secure_url,
    });
  } catch (error) {
    console.error("Upload chat audio error:", error);
    return res.status(500).json({
      status: "error",
      message: "Failed to upload audio.",
      error: error.message,
    });
  }
}

/* =====================================================
   SEND MESSAGE
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
            },
          );
          stream.end(file.buffer);
        });

        attachments.push({
          url: uploadResult.secure_url,
          name: file.originalname,
          type:
            uploadResult.resource_type === "image"
              ? "image"
              : uploadResult.resource_type === "video"
                ? "audio"
                : "file",
        });
      }
    }

    if (image) {
      attachments.push({
        url: image,
        name: "image",
        type: "image",
      });
    }

    if (audio) {
      attachments.push({
        url: audio,
        name: "audio",
        type: "audio",
      });
    }

    const newMessage = {
      content: content || null,
      sender: user._id,
      attachments,
      createdAt: new Date(),
      readBy: [user._id],
      edited: false,
      isDeletedForEveryone: false,
      deletedForUsers: [],
    };

    chat.messages.push(newMessage);
    await chat.save();

    const updatedChat = await Chat.findById(chat._id).populate(
      "messages.sender",
      "name email avatar",
    );

    const lastMessage = updatedChat.messages[updatedChat.messages.length - 1];

    return res.json({
      status: "success",
      message: lastMessage,
    });
  } catch (error) {
    console.error("Send message error:", error);
    return res.status(500).json({
      status: "error",
      error: error.message,
    });
  }
}

/* =====================================================
   EDIT MESSAGE
===================================================== */

export async function editMessage(req, res) {
  try {
    const user = req.user;
    const { chatId, messageId } = req.params;
    const { content } = req.body;

    const chat = await Chat.findById(chatId);
    if (!chat) {
      return res
        .status(404)
        .json({ status: "error", message: "Chat not found" });
    }

    const message = chat.messages.id(messageId);
    if (!message) {
      return res
        .status(404)
        .json({ status: "error", message: "Message not found" });
    }

    const isOwner = message.sender?.toString() === user._id.toString();

    if (!isOwner && user.role !== "admin") {
      return res.status(403).json({
        status: "error",
        message: "Nemáte oprávnění upravit tuto zprávu",
      });
    }

    message.content = content || "";
    message.edited = true;

    await chat.save();

    const populatedChat = await Chat.findById(chatId).populate(
      "messages.sender",
      "name email avatar",
    );

    const updatedMessage = populatedChat.messages.id(messageId);

    return res.json({
      status: "success",
      message: updatedMessage,
    });
  } catch (error) {
    console.error("Edit message error:", error);
    return res.status(500).json({
      status: "error",
      error: error.message,
    });
  }
}

/* =====================================================
   DELETE MESSAGE FOR ME
===================================================== */

export async function deleteMessageForMe(req, res) {
  try {
    const user = req.user;
    const { chatId, messageId } = req.params;

    const chat = await Chat.findById(chatId);
    if (!chat) {
      return res
        .status(404)
        .json({ status: "error", message: "Chat not found" });
    }

    const message = chat.messages.id(messageId);
    if (!message) {
      return res
        .status(404)
        .json({ status: "error", message: "Message not found" });
    }

    if (!Array.isArray(message.deletedForUsers)) {
      message.deletedForUsers = [];
    }

    const alreadyDeleted = message.deletedForUsers.some(
      (id) => id.toString() === user._id.toString(),
    );

    if (!alreadyDeleted) {
      message.deletedForUsers.push(user._id);
      await chat.save();
    }

    return res.json({
      status: "success",
      messageId,
      userId: user._id,
    });
  } catch (error) {
    console.error("Delete for me error:", error);
    return res.status(500).json({
      status: "error",
      error: error.message,
    });
  }
}

/* =====================================================
   DELETE MESSAGE FOR EVERYONE
===================================================== */

export async function deleteMessageForEveryone(req, res) {
  try {
    const user = req.user;
    const { chatId, messageId } = req.params;

    const chat = await Chat.findById(chatId);
    if (!chat) {
      return res
        .status(404)
        .json({ status: "error", message: "Chat not found" });
    }

    const message = chat.messages.id(messageId);
    if (!message) {
      return res
        .status(404)
        .json({ status: "error", message: "Message not found" });
    }

    const isOwner = message.sender?.toString() === user._id.toString();

    if (!isOwner && user.role !== "admin") {
      return res.status(403).json({
        status: "error",
        message: "Nemáte oprávnění smazat tuto zprávu",
      });
    }

    message.content = "Zpráva byla smazána";
    message.attachments = [];
    message.edited = false;
    message.isDeletedForEveryone = true;

    await chat.save();

    const populatedChat = await Chat.findById(chatId).populate(
      "messages.sender",
      "name email avatar",
    );

    const updatedMessage = populatedChat.messages.id(messageId);

    return res.json({
      status: "success",
      message: updatedMessage,
    });
  } catch (error) {
    console.error("Delete for everyone error:", error);
    return res.status(500).json({
      status: "error",
      error: error.message,
    });
  }
}
