import bcrypt from "bcryptjs";
import User from "../models/User.js";
import Invite from "../models/Invite.js";
import { generateToken } from "../utils/jwt.js";

/**
 * 🔐 LOGIN
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
    const user = await User.findOne({ email }).select("+password");

    if (!user || !user.isActive) {
      return res.status(401).json({
        status: "error",
        message: "Neplatné přihlašovací údaje.",
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
        name: user.name,
      },
    });
  } catch (error) {
    console.error("Login error:", error);
    return res.status(500).json({
      status: "error",
      message: "Chyba serveru.",
    });
  }
}

/**
 * 🔍 CHECK INVITE
 */
export async function checkInvite(req, res) {
  const { token } = req.params;

  try {
    const invite = await Invite.findOne({ token });

    if (!invite || invite.used || invite.expiresAt < new Date()) {
      return res.status(400).json({
        status: "error",
        message: "Neplatný nebo expirovaný odkaz.",
      });
    }

    return res.json({ status: "success" });
  } catch (error) {
    return res.status(500).json({ status: "error" });
  }
}

/**
 * 🔑 SET PASSWORD + AUTO LOGIN
 */
export async function setPassword(req, res) {
  const { token, password } = req.body;

  if (!token || !password) {
    return res.status(400).json({
      status: "error",
      message: "Token a heslo jsou povinné.",
    });
  }

  try {
    const invite = await Invite.findOne({ token }).populate("user");

    if (!invite || invite.used || invite.expiresAt < new Date()) {
      return res.status(400).json({
        status: "error",
        message: "Neplatný nebo expirovaný odkaz.",
      });
    }

    const hashedPassword = await bcrypt.hash(password, 10);

    invite.user.password = hashedPassword;
    invite.user.isActive = true;
    await invite.user.save();

    invite.used = true;
    await invite.save();

    const jwtToken = generateToken(invite.user);

    return res.json({
      status: "success",
      token: jwtToken,
      user: {
        id: invite.user._id,
        email: invite.user.email,
        role: invite.user.role,
        name: invite.user.name,
      },
    });
  } catch (error) {
    console.error(error);
    return res.status(500).json({ status: "error" });
  }
}