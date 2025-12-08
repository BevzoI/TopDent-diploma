// controllers/authController.js
import User from "../models/User.js";

// Простий login без JWT, без сесій – просто перевірка email+password
export async function auth (req, res) {
  const { email, password } = req.body;

  // Перевірка, що нам передали обидва поля
  if (!email || !password) {
    return res.status(400).json({
        status: "error",
        message: "Email a heslo jsou povinné."
    });
  }

  try {
    // Шукаємо користувача в базі
    const user = await User.findOne({ email });

    // Якщо немає користувача або пароль не співпадає
    if (!user || user?.password !== password) {
      return res
        .status(401)
        .json({
            status: "error",
            message: "Neplatné přihlašovací údaje."
        });
    }

    const userObj = user.toObject();
    delete userObj.password;

    // Повертаємо тільки безпечні поля (без password)
    return res.json({
      user: {
        id: user._id,
        ...userObj
      },
    });
  } catch (error) {
    console.error("Login error:", error);
    return res.status(500).json({ message: "Chyba serveru při přihlášení." });
  }
};




