import crypto from "crypto";
import User from "../models/User.js";
import Invite from "../models/Invite.js";


export const inviteUser = async (req, res) => {
  try {3
    const { email } = req.body;

    if (!email) {
      return res.status(400).json({ message: "Email is required" });
    }

    // 1️⃣ перевірка — чи юзер вже існує
    const existingUser = await User.findOne({ email });
    if (existingUser) {
      return res.status(400).json({ message: "User already exists" });
    }

    // 2️⃣ створюємо юзера БЕЗ пароля
    const user = await User.create({
      email,
      isActive: false,
    });

    // 3️⃣ генеруємо invite-token
    const token = crypto.randomUUID();

    await Invite.create({
      token,
      user: user._id,
      expiresAt: new Date(Date.now() + 48 * 60 * 60 * 1000), // 48h
    });

    // 4️⃣ формуємо універсальний лінк
    const inviteLink = `https://topdentteam.cz/invite?token=${token}`;

    return res.status(201).json({
      inviteLink,
      message: "Invite link created",
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Server error" });
  }
};
