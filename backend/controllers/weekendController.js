import Weekend from "../models/Weekend.js";
import User from "../models/User.js";

// GET all
export const getAllWeekend = async (req, res) => {
  try {
    const items = await Weekend.find()
      .populate("userId", "name clinic birthDate email") // ⬅ додаємо поля користувача
      .sort({ createdAt: -1 });

    await User.findByIdAndUpdate(req.headers["x-user-id"], {
      lastWeekendCheck: new Date(),
    });

    return res.json({
      status: "success",
      data: items,
    });
  } catch (error) {
    return res.status(500).json({
      status: "error",
      message: "Не вдалося отримати записи",
    });
  }
};

// GET one
export const getOneWeekend = async (req, res) => {
  try {
    const item = await Weekend.findById(req.params.id);

    if (!item) {
      return res.status(404).json({
        status: "error",
        message: "Запис не знайдено",
      });
    }

    return res.json({
      status: "success",
      data: item,
    });
  } catch (error) {
    return res.status(400).json({
      status: "error",
      message: "Не вдалося отримати запис",
    });
  }
};

// POST create
export const createWeekend = async (req, res) => {
  try {
    const item = await Weekend.create(req.body);

    return res.status(201).json({
      status: "success",
      data: item,
    });
  } catch (error) {
    return res.status(400).json({
      status: "error",
      message: "Не вдалося створити запис",
    });
  }
};

// PATCH update
export const updateWeekend = async (req, res) => {
  try {
    const item = await Weekend.findByIdAndUpdate(req.params.id, req.body, {
      new: true,
      runValidators: true,
    });

    if (!item) {
      return res.status(404).json({
        status: "error",
        message: "Запис не знайдено",
      });
    }

    return res.json({
      status: "success",
      data: item,
    });
  } catch (error) {
    return res.status(400).json({
      status: "error",
      message: "Не вдалося оновити запис",
    });
  }
};

// DELETE remove
export const deleteWeekend = async (req, res) => {
  try {
    const deleted = await Weekend.findByIdAndDelete(req.params.id);

    if (!deleted) {
      return res.status(404).json({
        status: "error",
        message: "Запис не знайдено",
      });
    }

    return res.json({
      status: "success",
      data: { message: "Запис видалено" },
    });
  } catch (error) {
    return res.status(400).json({
      status: "error",
      message: "Не вдалося видалити запис",
    });
  }
};

// PATCH /weekend/:id/status
export const updateWeekendStatus = async (req, res) => {
  try {
    const { status } = req.body;

    if (!["approved", "rejected"].includes(status)) {
      return res.status(400).json({
        status: "error",
        message: "Neplatný status",
      });
    }

    const item = await Weekend.findByIdAndUpdate(
      req.params.id,
      { status },
      { new: true }
    );

    if (!item) {
      return res.status(404).json({
        status: "error",
        message: "Záznam nebyl nalezen",
      });
    }

    return res.json({
      status: "success",
      data: item,
    });
  } catch (error) {
    return res.status(400).json({
      status: "error",
      message: "Nepodařilo se aktualizovat status",
    });
  }
};
