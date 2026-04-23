import User from "../models/User.js";
import Invite from "../models/Invite.js";
import crypto from "crypto";
import bcrypt from "bcryptjs";
import cloudinary from "../utils/cloudinary.js";
import { sendInviteEmail } from "../utils/sendEmail.js";

/* =====================================================
   CREATE USER (WITH INVITE FLOW)
===================================================== */
export async function createUser(req, res) {
  const { email, role, phone, groups } = req.body;

  if (!email) {
    return res.status(400).json({
      status: "error",
      message: "Email je povinný.",
    });
  }

  try {
    const exists = await User.findOne({ email: email.trim() });
    if (exists) {
      return res.status(400).json({
        status: "error",
        message: "Uživatel již existuje.",
      });
    }

    const randomIndex = Math.floor(Math.random() * 100) + 1;
    const avatarPath = `AV${randomIndex}.webp`;

    const newUser = await User.create({
      email: email.trim(),
      role: role || "user",
      phone: phone || "",
      avatar: avatarPath,
      groups: Array.isArray(groups) ? groups : [],
      isActive: false,
    });

    const token = crypto.randomBytes(32).toString("hex");

    await Invite.create({
      token,
      user: newUser._id,
      expiresAt: new Date(Date.now() + 1000 * 60 * 60 * 24),
    });

    const inviteLink = `${process.env.FRONTEND_URL}/invite/${token}`;

    let emailSent = true;
    let emailError = null;

    try {
      await sendInviteEmail(email.trim(), inviteLink);
    } catch (err) {
      emailSent = false;
      emailError = err?.message || "Email send failed";
      console.log("Email send error:", emailError);
    }

    return res.json({
      status: "success",
      user: {
        id: newUser._id,
        _id: newUser._id,
        email: newUser.email,
        role: newUser.role,
        phone: newUser.phone,
        avatar: newUser.avatar,
        isActive: newUser.isActive,
        groups: newUser.groups,
      },
      inviteLink,
      emailSent,
      emailError,
      message: emailSent
        ? "Uživatel byl vytvořen a pozvánka byla odeslána."
        : "Uživatel byl vytvořen, ale e-mail s pozvánkou se nepodařilo odeslat.",
    });
  } catch (error) {
    console.error("Create user error:", error);
    return res.status(500).json({
      status: "error",
      message: "Chyba serveru při vytváření uživatele.",
      error: error.message,
    });
  }
}

/* =====================================================
   GET ALL USERS
===================================================== */
export async function getAllUsers(req, res) {
  try {
    const users = await User.find().populate("groups").lean();

    return res.json({
      status: "success",
      users: users.map((u) => ({
        ...u,
        id: u._id,
      })),
    });
  } catch (error) {
    console.error("Get all users error:", error);
    return res.status(500).json({
      status: "error",
      message: "Chyba serveru při načítání uživatelů.",
    });
  }
}

/* =====================================================
   GET USER BY ID
===================================================== */
export async function getUserById(req, res) {
  try {
    const user = await User.findById(req.params.id).populate("groups").lean();

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

/* =====================================================
   UPDATE USER BY ID (ADMIN)
===================================================== */
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
      isActive,
    } = req.body;

    const updateData = {};

    if (email !== undefined) updateData.email = email?.trim();
    if (phone !== undefined) updateData.phone = phone?.trim();
    if (name !== undefined) updateData.name = name?.trim();
    if (clinic !== undefined) updateData.clinic = clinic?.trim();
    if (birthDate !== undefined) updateData.birthDate = birthDate || null;
    if (role !== undefined) updateData.role = role;
    if (typeof isActive === "boolean") updateData.isActive = isActive;

    if (password && password.trim().length > 0) {
      updateData.password = await bcrypt.hash(password.trim(), 10);
      updateData.isActive = true;
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

/* =====================================================
   DELETE USER
===================================================== */
export async function deleteUser(req, res) {
  try {
    await User.findByIdAndDelete(req.params.id);
    return res.json({ status: "success" });
  } catch (error) {
    console.error("Delete user error:", error);
    return res.status(500).json({
      status: "error",
      message: "Chyba serveru při mazání.",
    });
  }
}

/* =====================================================
   GET USER NOTIFICATIONS
===================================================== */
export async function getUserNotifications(req, res) {
  try {
    const user = await User.findById(req.params.userId).lean();

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

/* =====================================================
   GET MY PROFILE
===================================================== */
export async function getMe(req, res) {
  try {
    const user = await User.findById(req.user._id)
      .populate("groups")
      .select("-password")
      .lean();

    if (!user) {
      return res.status(404).json({
        status: "error",
        message: "Uživatel nebyl nalezen.",
      });
    }

    return res.json({
      status: "success",
      data: {
        ...user,
        id: user._id,
      },
    });
  } catch (error) {
    console.error("Get me error:", error);
    return res.status(500).json({
      status: "error",
      message: "Nepodařilo se načíst profil.",
    });
  }
}

/* =====================================================
   UPDATE MY PROFILE
===================================================== */
export async function updateMe(req, res) {
  try {
    const userId = req.user._id;
    const { phone } = req.body;

    const updateData = {};

    if (phone !== undefined) {
      updateData.phone = phone?.trim();
    }

    const updatedUser = await User.findByIdAndUpdate(userId, updateData, {
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
      data: {
        id: updatedUser._id,
        _id: updatedUser._id,
        email: updatedUser.email,
        role: updatedUser.role,
        avatar: updatedUser.avatar,
        phone: updatedUser.phone,
        name: updatedUser.name,
        groups: updatedUser.groups || [],
      },
    });
  } catch (error) {
    console.error("Update me error:", error);
    return res.status(500).json({
      status: "error",
      message: "Nepodařilo se upravit profil.",
    });
  }
}

/* =====================================================
   CHANGE MY PASSWORD
===================================================== */
export async function changeMyPassword(req, res) {
  try {
    const userId = req.user._id;
    const { currentPassword, newPassword } = req.body;

    if (!currentPassword || !newPassword) {
      return res.status(400).json({
        status: "error",
        message: "Vyplňte aktuální a nové heslo.",
      });
    }

    if (newPassword.trim().length < 6) {
      return res.status(400).json({
        status: "error",
        message: "Nové heslo musí mít alespoň 6 znaků.",
      });
    }

    const user = await User.findById(userId);

    if (!user) {
      return res.status(404).json({
        status: "error",
        message: "Uživatel nebyl nalezen.",
      });
    }

    const isMatch = await bcrypt.compare(currentPassword, user.password);

    if (!isMatch) {
      return res.status(400).json({
        status: "error",
        message: "Aktuální heslo není správné.",
      });
    }

    user.password = await bcrypt.hash(newPassword.trim(), 10);
    await user.save();

    return res.json({
      status: "success",
      message: "Heslo bylo změněno.",
    });
  } catch (error) {
    console.error("Change password error:", error);
    return res.status(500).json({
      status: "error",
      message: "Nepodařilo se změnit heslo.",
    });
  }
}

/* =====================================================
   UPDATE AVATAR (ME)
===================================================== */
export async function updateAvatar(req, res) {
  try {
    const userId = req.user._id;

    if (!req.file) {
      return res.status(400).json({
        status: "error",
        message: "Avatar file is required.",
      });
    }

    const uploadResult = await new Promise((resolve, reject) => {
      const stream = cloudinary.uploader.upload_stream(
        {
          folder: "avatars",
          public_id: `user_${userId}`,
          overwrite: true,
          resource_type: "image",
        },
        (error, result) => {
          if (error) reject(error);
          else resolve(result);
        },
      );

      stream.end(req.file.buffer);
    });

    const updatedUser = await User.findByIdAndUpdate(
      userId,
      { avatar: uploadResult.secure_url },
      { new: true },
    ).lean();

    return res.json({
      status: "success",
      data: {
        id: updatedUser._id,
        _id: updatedUser._id,
        email: updatedUser.email,
        role: updatedUser.role,
        avatar: updatedUser.avatar,
        phone: updatedUser.phone,
        name: updatedUser.name,
      },
    });
  } catch (error) {
    console.error("Update avatar error:", error);
    return res.status(500).json({
      status: "error",
      message: "Chyba při aktualizaci avatara.",
    });
  }
}
