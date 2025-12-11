import Poll from "../models/Poll.js";
import User from "../models/User.js";

// GET /poll
export const getAllPolls = async (req, res) => {
    try {
        const role = req.headers["x-user-role"] || "user";
        const userId = req.headers["x-user-id"];

        let query = {};

        if (role !== "admin") {
            query = {
                publish: "show",
                $or: [
                { users: [] },            // для всіх
                { users: userId },        // або для конкретного юзера
                ]
            };
        }

        const items = await Poll.find(query).sort({ createdAt: -1 });

        await User.findByIdAndUpdate(req.headers["x-user-id"], { newPoll: false });

        return res.json({
            status: "success",
            data: items,
        });
    } catch (error) {
        return res.status(500).json({
            status: "error",
            message: "Не вдалося отримати опитування",
        });
    }
};

// GET /poll/:id
export const getOnePoll = async (req, res) => {
    try {
        const item = await Poll.findById(req.params.id);

        if (!item) {
            return res.status(404).json({
                status: "error",
                message: "Опитування не знайдено",
            });
        }

        return res.json({
            status: "success",
            data: item,
        });
    } catch (error) {
        return res.status(400).json({
            status: "error",
            message: "Не вдалося отримати опитування",
        });
    }
};

// POST /poll
export const createPoll = async (req, res) => {
    try {
        const item = await Poll.create(req.body);

        await User.updateMany({}, { $set: { newPoll: true } });

        return res.status(201).json({
            status: "success",
            data: item,
        });
    } catch (error) {
        return res.status(400).json({
            status: "error",
            message: "Не вдалося створити опитування",
        });
    }
};

// PATCH /poll/:id
export const updatePoll = async (req, res) => {
    try {
        const item = await Poll.findByIdAndUpdate(req.params.id, req.body, { new: true, runValidators: true });

        if (!item) {
            return res.status(404).json({
                status: "error",
                message: "Опитування не знайдено",
            });
        }

        return res.json({
            status: "success",
            data: item,
        });
    } catch (error) {
        return res.status(400).json({
            status: "error",
            message: "Не вдалося оновити опитування",
        });
    }
};

// PATCH /poll/:id/answer
export const answerPoll = async (req, res) => {
    try {
        const { userId, value } = req.body;

        if (!["yes", "no"].includes(value)) {
            return res.status(400).json({
                status: "error",
                message: "Невірна відповідь",
            });
        }

        const poll = await Poll.findById(req.params.id);
        if (!poll) {
            return res.status(404).json({
                status: "error",
                message: "Опитування не знайдено",
            });
        }

        // Шукаємо чи юзер вже відповідав
        const existing = poll.answers.find((a) => a.userId.toString() === userId);

        if (existing) {
            existing.value = value;
            existing.answeredAt = new Date();
        } else {
            poll.answers.push({ userId, value });
        }

        await poll.save();

        return res.json({
            status: "success",
            data: poll,
        });
    } catch (error) {
        return res.status(400).json({
            status: "error",
            message: "Не вдалося зберегти відповідь",
        });
    }
};

// DELETE /poll/:id
export const deletePoll = async (req, res) => {
    try {
        const deleted = await Poll.findByIdAndDelete(req.params.id);

        if (!deleted) {
            return res.status(404).json({
                status: "error",
                message: "Опитування не знайдено",
            });
        }

        return res.json({
            status: "success",
            data: { message: "Опитування видалено" },
        });
    } catch (error) {
        return res.status(400).json({
            status: "error",
            message: "Не вдалося видалити опитування",
        });
    }
};
