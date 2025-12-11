import Chat from "../models/Chat.js";
import User from "../models/User.js";

// CREATE CHAT
export const createChat = async (req, res) => {
  try {
    const chat = await Chat.create({
      title: req.body.title,
      members: req.body.members,
      publish: req.body.publish,
      createdBy: req.userId, // якщо передаєш у header
    });

    return res.json({ status: "success", data: chat });
  } catch (err) {
    return res.status(500).json({ status: "error", message: "Nepodařilo se vytvořit chat" });
  }
};

// GET ALL CHATS
export const getAllChats = async (req, res) => {
  try {
    const userId = req.headers["x-user-id"];

    const chats = await Chat.find({
      $or: [
        { members: [] },          // ALL USERS
        { members: userId },      // user is a member
        { publish: "show" },      // public chats
      ]
    }).sort({ updatedAt: -1 });

    await User.findByIdAndUpdate(req.headers["x-user-id"], {
      lastChatCheck: new Date()
    });
    
    return res.json({ status: "success", data: chats });
  } catch (err) {
    return res.status(500).json({ status: "error", message: "Nepodařilo se načíst chaty" });
  }
};


// GET ONE CHAT + messages
export const getOneChat = async (req, res) => {
  try {
    const chat = await Chat.findById(req.params.id)
      .populate("messages.sender", "name avatar email");

    if (!chat) {
      return res.status(404).json({ status: "error", message: "Chat nenalezen" });
    }

    return res.json({ status: "success", data: chat });
  } catch (err) {
    return res.status(500).json({ status: "error", message: "Chyba při načítání chatu" });
  }
};

// UPDATE CHAT
export const updateChat = async (req, res) => {
  try {
    const chat = await Chat.findByIdAndUpdate(req.params.id, req.body, { new: true });

    return res.json({ status: "success", data: chat });
  } catch (err) {
    return res.status(500).json({ status: "error", message: "Nepodařilo se upravit chat" });
  }
};

// DELETE CHAT
export const deleteChat = async (req, res) => {
  try {
    await Chat.findByIdAndDelete(req.params.id);

    return res.json({ status: "success", message: "Chat byl smazán" });
  } catch (err) {
    return res.status(500).json({ status: "error", message: "Nepodařilo se smazat chat" });
  }
};

// SEND MESSAGE
export const sendMessage = async (req, res) => {
  try {
    const { content, sender } = req.body;

    const chat = await Chat.findById(req.params.id);
    if (!chat) {
      return res.status(404).json({ status: "error", message: "Chat nenalezen" });
    }

    chat.messages.push({ sender, content });
    await chat.save();

    return res.json({ status: "success", data: chat });
  } catch (err) {
    return res.status(500).json({ status: "error", message: "Nepodařilo se odeslat zprávu" });
  }
};

export const getNewMessages = async (req, res) => {
  try {
    const chatId = req.params.id;
    const since = req.query.since ? new Date(req.query.since) : null;

    const chat = await Chat.findById(chatId).select("messages");

    if (!chat) {
      return res.status(404).json({ status: "error", message: "Chat nenalezen" });
    }

    let msgs = chat.messages;

    if (since) {
      msgs = msgs.filter((msg) => msg.createdAt > since);
    }

    return res.json({
      status: "success",
      data: msgs,
    });

  } catch (err) {
    return res.status(500).json({ status: "error", message: "Chyba při načítání zpráv" });
  }
};
