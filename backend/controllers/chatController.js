import Chat from "../models/Chat.js";
import User from "../models/User.js";

// 🔐 Helper – перевірка доступу
async function checkAccess(chat, user) {
  if (!chat.groups || chat.groups.length === 0) return true;

  const userGroups = user.groups.map((g) => g.toString());

  return chat.groups.some((g) =>
    userGroups.includes(g.toString())
  );
}

// -------------------------
// GET ALL CHATS (по групах)
// -------------------------
export async function getChats(req, res) {
  try {
    const userId = req.headers["x-user-id"];

    const user = await User.findById(userId);

    if (!user) return res.status(404).json({ status: "error" });

    const chats = await Chat.find({
      $or: [
        { groups: { $size: 0 } },
        { groups: { $in: user.groups } },
      ],
    })
      .populate("groups")
      .lean();

    return res.json({
      status: "success",
      data: chats.map((c) => ({ ...c, id: c._id })),
    });
  } catch (error) {
    console.error(error);
    return res.status(500).json({ status: "error" });
  }
}

// -------------------------
// GET SINGLE CHAT
// -------------------------
export async function getChatById(req, res) {
  try {
    const { id } = req.params;
    const userId = req.headers["x-user-id"];

    const user = await User.findById(userId);
    const chat = await Chat.findById(id)
      .populate("groups")
      .populate("messages.sender")
      .lean();

    if (!chat) {
      return res.status(404).json({ status: "error" });
    }

    const allowed = await checkAccess(chat, user);

    if (!allowed) {
      return res.status(403).json({ status: "error" });
    }

    return res.json({
      status: "success",
      data: { ...chat, id: chat._id },
    });
  } catch (error) {
    console.error(error);
    return res.status(500).json({ status: "error" });
  }
}

// -------------------------
// CREATE CHAT
// -------------------------
export async function createChat(req, res) {
  try {
    const { title, publish, groups } = req.body;

    const newChat = await Chat.create({
      title,
      publish,
      groups: Array.isArray(groups) ? groups : [],
      messages: [],
    });

    const populated = await Chat.findById(newChat._id)
      .populate("groups")
      .lean();

    return res.json({
      status: "success",
      data: { ...populated, id: populated._id },
    });
  } catch (error) {
    console.error(error);
    return res.status(500).json({ status: "error" });
  }
}

// -------------------------
// UPDATE CHAT
// -------------------------
export async function updateChat(req, res) {
  try {
    const { id } = req.params;
    const { title, publish, groups } = req.body;

    const updated = await Chat.findByIdAndUpdate(
      id,
      {
        title,
        publish,
        groups: Array.isArray(groups) ? groups : [],
      },
      { new: true }
    )
      .populate("groups")
      .lean();

    return res.json({
      status: "success",
      data: { ...updated, id: updated._id },
    });
  } catch (error) {
    console.error(error);
    return res.status(500).json({ status: "error" });
  }
}

// -------------------------
// DELETE CHAT
// -------------------------
export async function deleteChat(req, res) {
  try {
    const { id } = req.params;
    await Chat.findByIdAndDelete(id);
    return res.json({ status: "success" });
  } catch (error) {
    return res.status(500).json({ status: "error" });
  }
}

// -------------------------
// SEND MESSAGE
// -------------------------
export async function sendMessage(req, res) {
  try {
    const { id } = req.params;
    const { content } = req.body;
    const sender = req.headers["x-user-id"];

    const user = await User.findById(sender);
    const chat = await Chat.findById(id);

    if (!chat) return res.status(404).json({ status: "error" });

    const allowed = await checkAccess(chat, user);
    if (!allowed) return res.status(403).json({ status: "error" });

    chat.messages.push({
      content,
      sender,
    });

    await chat.save();

    const updated = await Chat.findById(id)
      .populate("messages.sender")
      .lean();

    return res.json({
      status: "success",
      data: { ...updated, id: updated._id },
    });
  } catch (error) {
    console.error(error);
    return res.status(500).json({ status: "error" });
  }
}