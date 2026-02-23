import User from "../models/User.js";
import cloudinary from "../utils/cloudinary.js";

// -------------------------
// CREATE USER
// -------------------------
export async function createUser(req, res) {
  const { email, password, role, phone, groups } = req.body;

  if (!email || !password) {
    return res.status(400).json({
      status: "error",
      message: "Email a heslo jsou povinné.",
    });
  }

  try {
    const exists = await User.findOne({ email });
    if (exists) {
      return res.status(400).json({
        status: "error",
        message: "Uživatel již existuje.",
      });
    }

    const randomIndex = Math.floor(Math.random() * 100) + 1;
    const avatarPath = `AV${randomIndex}.webp`;

    const newUser = await User.create({
      email,
      password,
      role: role || "user",
      phone: phone || "",
      avatar: avatarPath,
      groups: Array.isArray(groups) ? groups : [],
    });

    const populatedUser = await User.findById(newUser._id)
      .populate("groups")
      .lean();

    return res.json({
      status: "success",
      user: {
        ...populatedUser,
        id: populatedUser._id,
      },
    });
  } catch (error) {
    console.error("Create user error:", error);
    return res.status(500).json({
      status: "error",
      message: "Chyba serveru při vytváření uživatele.",
    });
  }
}

// -------------------------
// GET ALL USERS
// -------------------------
export async function getAllUsers(req, res) {
  try {
    const users = await User.find()
      .populate("groups")
      .lean();

    const formattedUsers = users.map((u) => ({
      ...u,
      id: u._id,
    }));

    return res.json({
      status: "success",
      users: formattedUsers,
    });
  } catch (error) {
    console.error("Get all users error:", error);
    return res.status(500).json({
      status: "error",
      message: "Chyba serveru při načítání uživatelů.",
    });
  }
}

// -------------------------
// GET USER BY ID
// -------------------------
export async function getUserById(req, res) {
  try {
    const { id } = req.params;

    const user = await User.findById(id)
      .populate("groups")
      .lean();

    if (!user) {
      return res.status(404).json({
        status: "error",
        message: "Uživatel nebyl nalezen.",
      });
    }

    return res.json({
      status: "success",
      user: {
        ...user,
        id: user._id,
      },
    });
  } catch (error) {
    console.error("Get user error:", error);
    return res.status(500).json({
      status: "error",
      message: "Chyba serveru.",
    });
  }
}

// -------------------------
// UPDATE USER
// -------------------------
export async function updateUserById(req, res) {
  try {
    const { id } = req.params;

    const {
      name,
      clinic,
      birthDate,
      email,
      phone,
      role,
      avatar,
      password,
      groups,
    } = req.body;

    const updateData = {};

    if (email) updateData.email = email.trim();
    if (phone) updateData.phone = phone.trim();
    if (name !== undefined) updateData.name = name.trim();
    if (clinic !== undefined) updateData.clinic = clinic.trim();
    if (birthDate !== undefined) updateData.birthDate = birthDate || null;
    if (role) updateData.role = role;

    if (password && password.trim().length > 0) {
      updateData.password = password.trim();
    }

    if (Array.isArray(groups)) {
      updateData.groups = groups;
    }

    if (avatar && typeof avatar === "string") {
      if (avatar.startsWith("data:image")) {
        const upload = await cloudinary.uploader.upload(avatar, {
          folder: "avatars",
          public_id: `user_${id}`,
          overwrite: true,
        });
        updateData.avatar = upload.secure_url;
      } else {
        updateData.avatar = avatar;
      }
    }

    const updatedUser = await User.findByIdAndUpdate(id, updateData, {
      new: true,
    })
      .populate("groups")
      .lean();

    if (!updatedUser) {
      return res.status(404).json({
        status: "error",
        message: "Uživatel nebyl nalezen.",
      });
    }

    return res.json({
      status: "success",
      user: {
        ...updatedUser,
        id: updatedUser._id,
      },
    });
  } catch (error) {
    console.error("Update user error:", error);
    return res.status(500).json({
      status: "error",
      message: "Chyba serveru při aktualizaci.",
    });
  }
}

// -------------------------
// DELETE USER
// -------------------------
export async function deleteUser(req, res) {
  try {
    const { id } = req.params;

    await User.findByIdAndDelete(id);

    return res.json({
      status: "success",
    });
  } catch (error) {
    console.error("Delete user error:", error);
    return res.status(500).json({
      status: "error",
      message: "Chyba serveru při mazání.",
    });
  }
}

// -------------------------
// GET USER NOTIFICATIONS
// -------------------------
export async function getUserNotifications(req, res) {
  try {
    const { userId } = req.params;

    const user = await User.findById(userId).lean();

    if (!user) {
      return res.status(404).json({
        status: "error",
        message: "Uživatel nebyl nalezen.",
      });
    }

    return res.json({
      status: "success",
      data: {
        news: user.newNews,
        chat: user.newChat,
        poll: user.newPoll,
        courses: user.newCourse,
        events: user.newEvent,
        weekend: user.newWeekend,
      },
    });
  } catch (error) {
    console.error("Notifications error:", error);
    return res.status(500).json({
      status: "error",
      message: "Chyba serveru.",
    });
  }
}