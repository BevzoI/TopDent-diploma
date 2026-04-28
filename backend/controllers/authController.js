import bcrypt from "bcryptjs";
import User from "../models/User.js";
import Invite from "../models/Invite.js";
import { generateToken } from "../utils/jwt.js";

/**
 * LOGIN
 */
export async function login(req, res) {
  const { email, password } = req.body;

  if (!email || !password) {
    return res.status(400).json({
      status: "error",
      message: "Email a heslo jsou povinné.",
    });
  }

  try {
    const user = await User.findOne({
      email: email.trim().toLowerCase(),
    }).select("+password");

    if (!user) {
      return res.status(401).json({
        status: "error",
        message: "Neplatné přihlašovací údaje.",
      });
    }

    if (!user.isActive) {
      return res.status(401).json({
        status: "error",
        message: "Účet není aktivovaný.",
      });
    }

    if (!user.password) {
      return res.status(401).json({
        status: "error",
        message: "Účet nemá nastavené heslo.",
      });
    }

    const passwordMatch = await bcrypt.compare(password, user.password);

    if (!passwordMatch) {
      return res.status(401).json({
        status: "error",
        message: "Neplatné přihlašovací údaje.",
      });
    }

    const token = generateToken(user);

    return res.json({
      status: "success",
      token,
      user: {
        id: user._id,
        email: user.email,
        role: user.role,
        name: user.name || "",
        avatar: user.avatar || "",
        phone: user.phone || "",
      },
    });
  } catch (error) {
    console.error("Login error:", error);
    return res.status(500).json({
      status: "error",
      message: "Chyba serveru.",
      error: error.message,
    });
  }
}

/**
 * CHECK INVITE
 */
export async function checkInvite(req, res) {
  const { token } = req.params;

  try {
    const invite = await Invite.findOne({ token }).populate("user");

    if (!invite || invite.used || invite.expiresAt < new Date()) {
      return res.status(400).json({
        status: "error",
        message: "Neplatný nebo expirovaný odkaz.",
      });
    }

    return res.json({
      status: "success",
      data: {
        email: invite.user?.email || "",
      },
    });
  } catch (error) {
    console.error("Check invite error:", error);
    return res.status(500).json({
      status: "error",
      message: "Chyba serveru.",
    });
  }
}

/**
 * SET PASSWORD + AUTO LOGIN
 */
export async function setPassword(req, res) {
  const { token, password } = req.body;

  if (!token || !password) {
    return res.status(400).json({
      status: "error",
      message: "Token a heslo jsou povinné.",
    });
  }

  if (String(password).trim().length < 6) {
    return res.status(400).json({
      status: "error",
      message: "Heslo musí mít alespoň 6 znaků.",
    });
  }

  try {
    const invite = await Invite.findOne({ token });

    if (!invite || invite.used || invite.expiresAt < new Date()) {
      return res.status(400).json({
        status: "error",
        message: "Neplatný nebo expirovaný odkaz.",
      });
    }

    const user = await User.findById(invite.user).select("+password");

    if (!user) {
      return res.status(404).json({
        status: "error",
        message: "Uživatel nenalezen.",
      });
    }

    user.password = password;
    user.isActive = true;

    await user.save();

    invite.used = true;
    await invite.save();

    const jwtToken = generateToken(user);

    return res.json({
      status: "success",
      token: jwtToken,
      user: {
        id: user._id,
        email: user.email,
        role: user.role,
        name: user.name || "",
        avatar: user.avatar || "",
        phone: user.phone || "",
      },
    });
  } catch (error) {
    console.error("Set password error:", error);
    return res.status(500).json({
      status: "error",
      message: "Chyba serveru.",
      error: error.message,
    });
  }
}
