import Event from "../models/Event.js";
import User from "../models/User.js";

// CREATE
export const createEvent = async (req, res) => {
  try {
    const currentUserId = req.user?._id || req.headers["x-user-id"] || null;

    const item = await Event.create(req.body);

    await User.updateMany(
      currentUserId ? { _id: { $ne: currentUserId } } : {},
      { $set: { newEvent: true } },
    );

    return res.json({
      status: "success",
      data: item,
    });
  } catch (error) {
    console.error("Create event error:", error);
    return res.status(500).json({
      status: "error",
      message: "Nepodařilo se vytvořit událost",
      error: error.message,
    });
  }
};

// GET ALL
export const getAllEvents = async (req, res) => {
  try {
    const userId = req.user?._id || req.headers["x-user-id"];
    const role = req.user?.role || req.headers["x-user-role"];

    let query = {};

    if (role !== "admin") {
      query = {
        publish: "show",
        $or: [{ users: [] }, { users: userId }],
      };
    }

    const items = await Event.find(query).sort({ dateTime: 1 });

    if (userId) {
      await User.findByIdAndUpdate(userId, { newEvent: false });
    }

    return res.json({
      status: "success",
      data: items,
    });
  } catch (error) {
    console.error("Get all events error:", error);
    return res.status(500).json({
      status: "error",
      message: "Nepodařilo se načíst události",
      error: error.message,
    });
  }
};

// GET ONE
export const getOneEvent = async (req, res) => {
  try {
    const item = await Event.findById(req.params.id);

    if (!item) {
      return res.status(404).json({
        status: "error",
        message: "Událost nenalezena",
      });
    }

    return res.json({
      status: "success",
      data: item,
    });
  } catch (error) {
    console.error("Get one event error:", error);
    return res.status(500).json({
      status: "error",
      message: "Chyba při načítání události",
      error: error.message,
    });
  }
};

// UPDATE
export const updateEvent = async (req, res) => {
  try {
    const currentUserId = req.user?._id || req.headers["x-user-id"] || null;

    const item = await Event.findByIdAndUpdate(req.params.id, req.body, {
      new: true,
    });

    if (!item) {
      return res.status(404).json({
        status: "error",
        message: "Událost nenalezena",
      });
    }

    await User.updateMany(
      currentUserId ? { _id: { $ne: currentUserId } } : {},
      { $set: { newEvent: true } },
    );

    return res.json({
      status: "success",
      data: item,
    });
  } catch (error) {
    console.error("Update event error:", error);
    return res.status(500).json({
      status: "error",
      message: "Nepodařilo se upravit událost",
      error: error.message,
    });
  }
};

// DELETE
export const deleteEvent = async (req, res) => {
  try {
    const deleted = await Event.findByIdAndDelete(req.params.id);

    if (!deleted) {
      return res.status(404).json({
        status: "error",
        message: "Událost nenalezena",
      });
    }

    return res.json({
      status: "success",
      message: "Událost smazána",
    });
  } catch (error) {
    console.error("Delete event error:", error);
    return res.status(500).json({
      status: "error",
      message: "Nepodařilo se smazat událost",
      error: error.message,
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
      return res.status(404).json({
        status: "error",
        message: "Událost nenalezena",
      });
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
    console.error("Answer event error:", error);
    return res.status(500).json({
      status: "error",
      message: "Nepodařilo se uložit odpověď",
      error: error.message,
    });
  }
};
