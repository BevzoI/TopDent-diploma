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

    // Повертаємо тільки безпечні поля (без password)
    return res.json({
      user: {
        id: user._id,
        email: user.email,
        role: user.role,
      },
    });
  } catch (error) {
    console.error("Login error:", error);
    return res.status(500).json({ message: "Chyba serveru při přihlášení." });
  }
};


// -------------------------
// Створення нового користувача
// -------------------------
export async function createUser(req, res) {
  const { email, password, role } = req.body;

  if (!email || !password) {
    return res.status(400).json({
      status: "error",
      message: "Email a heslo jsou povinné."
    });
  }

  try {
    // Перевіряємо, чи такий email вже існує
    const exists = await User.findOne({ email });

    if (exists) {
      return res.status(400).json({
        status: "error",
        message: "Uživatel již existuje."
      });
    }

    // Створюємо нового користувача
    const newUser = await User.create({
      email,
      password, // ⚠️ пароль поки зберігається у відкритому вигляді (демо)
      role: role || "user",
    });

    return res.json({
      status: "success",
      user: {
        id: newUser._id,
        email: newUser.email,
        role: newUser.role,
      },
    });

  } catch (error) {
    console.error("Create user error:", error);
    return res.status(500).json({
      status: "error",
      message: "Chyba serveru při vytváření uživatele."
    });
  }
}
