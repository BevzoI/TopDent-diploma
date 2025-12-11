import Event from "../models/Event.js";
import User from "../models/User.js";

// CREATE
export const createEvent = async (req, res) => {
    try {
        const item = await Event.create(req.body);

        await User.updateMany({}, { $set: { newEvent: true } });

        return res.json({
            status: "success",
            data: item,
        });
    } catch (error) {
        return res.status(500).json({
            status: "error",
            message: "Nepodařilo se vytvořit událost",
        });
    }
};

// GET ALL
export const getAllEvents = async (req, res) => {
    try {
        const userId = req.headers["x-user-id"];
        const role = req.headers["x-user-role"];

        let query = {};

        if (role !== "admin") {
            query = {
                publish: "show",
                $or: [{ users: [] }, { users: userId }],
            };
        }

        const items = await Event.find(query).sort({ dateTime: 1 });

        await User.findByIdAndUpdate(req.headers["x-user-id"], { newEvent: false });

        return res.json({
            status: "success",
            data: items,
        });
    } catch (error) {
        return res.status(500).json({
            status: "error",
            message: "Nepodařilo se načíst události",
        });
    }
};

// GET ONE
export const getOneEvent = async (req, res) => {
    try {
        const item = await Event.findById(req.params.id);

        if (!item) {
            return res.status(404).json({ status: "error", message: "Událost nenalezena" });
        }

        return res.json({
            status: "success",
            data: item,
        });
    } catch (error) {
        return res.status(500).json({
            status: "error",
            message: "Chyba při načítání události",
        });
    }
};

// UPDATE
export const updateEvent = async (req, res) => {
    try {
        const item = await Event.findByIdAndUpdate(req.params.id, req.body, {
            new: true,
        });

        return res.json({
            status: "success",
            data: item,
        });
    } catch (error) {
        return res.status(500).json({
            status: "error",
            message: "Nepodařilo se upravit událost",
        });
    }
};

// DELETE
export const deleteEvent = async (req, res) => {
    try {
        await Event.findByIdAndDelete(req.params.id);

        return res.json({
            status: "success",
            message: "Událost smazána",
        });
    } catch (error) {
        return res.status(500).json({
            status: "error",
            message: "Nepodařilo se smazat událost",
        });
    }
};

// ANSWER (yes | no)
export const answerEvent = async (req, res) => {
    try {
        const { userId, value } = req.body;
        const { id } = req.params;

        const event = await Event.findById(id);
        if (!event) {
            return res.status(404).json({ status: "error", message: "Událost nenalezena" });
        }

        const existing = event.answers.find((a) => a.userId.toString() === userId);

        if (existing) {
            existing.value = value;
            existing.answeredAt = new Date();
        } else {
            event.answers.push({ userId, value });
        }

        await event.save();

        return res.json({
            status: "success",
            data: event,
        });
    } catch (error) {
        return res.status(500).json({
            status: "error",
            message: "Nepodařilo se uložit odpověď",
        });
    }
};
