// controllers/usersController.js
import User from "../models/User.js";
import cloudinary from "../utils/cloudinary.js";
import { toSafeUser } from "../utils/utils.js";

// -------------------------
// Створення нового користувача
// -------------------------
export async function createUser(req, res) {
    const { email, password, role, phone } = req.body;

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

        // 🆕 Генеруємо випадковий аватар (1–100)
        const randomIndex = Math.floor(Math.random() * 100) + 1;
        const avatarPath = `AV${randomIndex}.webp`;

        const newUser = await User.create({
            email,
            password,
            role: role || "user",
            phone: phone || "",
            avatar: avatarPath,
        });

        return res.json({
            status: "success",
            user: {
                id: newUser._id,
                email: newUser.email,
                role: newUser.role,
                phone: newUser.phone,
                avatar: newUser.avatar,
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

// GET /users – всі користувачі (тільки admin)
export async function getAllUsers(req, res) {
    try {
        const users = await User.find().lean();

        const userRole = req.headers["x-user-role"];

        const safeUsers = users.map((u) => {
            const { password, ...rest } = u;

            // Додаємо id окремо
            const base = {
                ...rest,
                id: u._id,
            };

            // Якщо ADMIN → повертаємо пароль
            if (userRole === "admin") {
                return {
                    ...base,
                    password: u.password, // хеш
                };
            }

            // Якщо НЕ admin → без пароля
            return base;
        });

        return res.json({
            status: "success",
            users: safeUsers,
        });
    } catch (error) {
        console.error("Get all users error:", error);
        return res.status(500).json({
            status: "error",
            message: "Помилка сервера при отриманні списку користувачів.",
        });
    }
}


// GET /users/:id – один користувач (тільки admin)
export async function getUserById(req, res) {
    try {
        const { id } = req.params;
        const user = await User.findById(id);

        if (!user) {
            return res.status(404).json({
                status: "error",
                message: "Користувача не знайдено.",
            });
        }

        const safeUser = toSafeUser(user);

        return res.json({
            status: "success",
            user: safeUser,
        });
    } catch (error) {
        console.error("Get user by id error:", error);
        return res.status(500).json({
            status: "error",
            message: "Помилка сервера при отриманні користувача.",
        });
    }
}

// PATCH /users/:id — admin může upravit libovolného uživatele
export async function updateUserById(req, res) {
    try {
        const { id } = req.params;
        const { name, clinic, birthDate, email, phone, role, avatar, password } = req.body;

        // ADMIN CHECK
        const userRole = req.headers["x-user-role"];
        if (userRole !== "admin") {
            return res.status(403).json({
                status: "error",
                message: "Pouze administrátor může upravovat uživatele.",
            });
        }

        const updateData = {};

        if (email) updateData.email = email.trim();
        if (phone) updateData.phone = phone.trim();
        if (name !== undefined) updateData.name = name.trim();
        if (clinic !== undefined) updateData.clinic = clinic.trim();
        if (birthDate !== undefined) updateData.birthDate = birthDate || null;

        // Pokud admin upravuje sebe → nesmí změnit roli
        if (role && req.userId !== id) {
            updateData.role = role;
        }

        // Parola — nepovinná
        if (password && password.trim().length > 0) {
            updateData.password = password.trim();
        }

        // Avatar logika
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
        });

        if (!updatedUser) {
            return res.status(404).json({
                status: "error",
                message: "Uživatel nebyl nalezen.",
            });
        }

        return res.json({
            status: "success",
            user: {
                id: updatedUser._id,
                email: updatedUser.email,
                role: updatedUser.role,
                phone: updatedUser.phone,
                avatar: updatedUser.avatar,
                name: updatedUser.name,
                clinic: updatedUser.clinic,
                birthDate: updatedUser.birthDate,
            },
        });
    } catch (error) {
        console.error("PATCH /users/:id error:", error);
        return res.status(500).json({
            status: "error",
            message: "Chyba serveru při aktualizaci uživatele.",
        });
    }
}

// DELETE /users/:id – видалення користувача (admin)
export async function deleteUser(req, res) {
    try {
        const role = req.headers["x-user-role"] || "user";
        if (role !== "admin") {
            return res.status(403).json({
                status: "error",
                message: "Немає доступу. Тільки admin може видаляти користувачів.",
            });
        }

        const { id } = req.params;

        const deleted = await User.findByIdAndDelete(id);

        if (!deleted) {
            return res.status(404).json({
                status: "error",
                message: "Користувача не знайдено.",
            });
        }

        return res.json({
            status: "success",
            data: { message: "Користувача видалено." },
        });
    } catch (error) {
        console.error("Delete user error:", error);
        return res.status(500).json({
            status: "error",
            message: "Помилка сервера при видаленні користувача.",
        });
    }
}

// GET /user/:userId
export const getUserNotifications = async (req, res) => {
    try {
        const { userId } = req.params;

        const user = await User.findById(userId);

        if (!user) {
            return res.status(404).json({
                status: "error",
                message: "Користувача не знайдено",
            });
        }

        //
        // SUCCESS RESPONSE
        //
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
            message: "Не вдалося отримати оповіщення",
        });
    }
};
