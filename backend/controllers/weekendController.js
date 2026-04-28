import Weekend from "../models/Weekend.js";
import User from "../models/User.js";

/* =====================================================
   GET ALL
===================================================== */
export const getAllWeekend = async (req, res) => {
  try {
    const currentUser = req.user;
    const currentUserId = currentUser?._id || req.headers["x-user-id"];
    const currentUserRole = currentUser?.role || req.headers["x-user-role"];

    let query = {};

    // 👤 user vidí jen své žádosti
    if (currentUserRole !== "admin") {
      query = { userId: currentUserId };
    }

    const items = await Weekend.find(query)
      .populate("userId", "name clinic birthDate email")
      .sort({ createdAt: -1 });

    if (currentUserId) {
      await User.findByIdAndUpdate(currentUserId, { newWeekend: false });
    }

    return res.json({
      status: "success",
      data: items,
    });
  } catch (error) {
    console.error("Get all weekend error:", error);
    return res.status(500).json({
      status: "error",
      message: "Не вдалося отримати записи",
      error: error.message,
    });
  }
};

/* =====================================================
   GET ONE
===================================================== */
export const getOneWeekend = async (req, res) => {
  try {
    const currentUser = req.user;
    const currentUserId = currentUser?._id || req.headers["x-user-id"];
    const currentUserRole = currentUser?.role || req.headers["x-user-role"];

    const item = await Weekend.findById(req.params.id).populate(
      "userId",
      "name clinic birthDate email",
    );

    if (!item) {
      return res.status(404).json({
        status: "error",
        message: "Запис не знайдено",
      });
    }

    if (
      currentUserRole !== "admin" &&
      item.userId?._id?.toString() !== currentUserId?.toString()
    ) {
      return res.status(403).json({
        status: "error",
        message: "Nemáte přístup k tomuto záznamu",
      });
    }

    return res.json({
      status: "success",
      data: item,
    });
  } catch (error) {
    console.error("Get one weekend error:", error);
    return res.status(400).json({
      status: "error",
      message: "Не вдалося отримати запис",
      error: error.message,
    });
  }
};

/* =====================================================
   POST CREATE
===================================================== */
export const createWeekend = async (req, res) => {
  try {
    const currentUserId = req.user?._id || req.headers["x-user-id"] || null;
    const { dateFrom, dateTo, reason, note } = req.body;

    if (!currentUserId) {
      return res.status(401).json({
        status: "error",
        message: "Unauthorized",
      });
    }

    if (!dateFrom || !dateTo || !reason) {
      return res.status(400).json({
        status: "error",
        message: "Vyplňte všechna povinná pole",
      });
    }

    if (!["vacation", "doctor", "sick_day", "other"].includes(reason)) {
      return res.status(400).json({
        status: "error",
        message: "Neplatný důvod",
      });
    }

    if (reason === "other" && !String(note || "").trim()) {
      return res.status(400).json({
        status: "error",
        message: "Pro možnost 'Jiné' vyplňte poznámku",
      });
    }

    const from = new Date(dateFrom);
    const to = new Date(dateTo);

    if (Number.isNaN(from.getTime()) || Number.isNaN(to.getTime())) {
      return res.status(400).json({
        status: "error",
        message: "Neplatné datum",
      });
    }

    if (to < from) {
      return res.status(400).json({
        status: "error",
        message: "Datum do nemůže být dříve než datum od",
      });
    }

    const item = await Weekend.create({
      userId: currentUserId,
      dateFrom: from,
      dateTo: to,
      reason,
      note: String(note || "").trim(),
      status: "new",
    });

    // 🔔 notify only admins
    await User.updateMany({ role: "admin" }, { $set: { newWeekend: true } });

    return res.status(201).json({
      status: "success",
      data: item,
    });
  } catch (error) {
    console.error("Create weekend error:", error);
    return res.status(400).json({
      status: "error",
      message: "Не вдалося створити запис",
      error: error.message,
    });
  }
};

/* =====================================================
   PATCH UPDATE
   user/admin může upravit jen pokud status = new
===================================================== */
export const updateWeekend = async (req, res) => {
  try {
    const currentUser = req.user;
    const currentUserId = currentUser?._id || req.headers["x-user-id"];
    const currentUserRole = currentUser?.role || req.headers["x-user-role"];

    const { dateFrom, dateTo, reason, note } = req.body;

    const item = await Weekend.findById(req.params.id);

    if (!item) {
      return res.status(404).json({
        status: "error",
        message: "Запис не знайдено",
      });
    }

    if (
      currentUserRole !== "admin" &&
      item.userId.toString() !== currentUserId?.toString()
    ) {
      return res.status(403).json({
        status: "error",
        message: "Nemáte oprávnění upravit tento záznam",
      });
    }

    if (item.status !== "new") {
      return res.status(400).json({
        status: "error",
        message: "Lze upravit jen žádost ve stavu 'new'",
      });
    }

    if (
      reason &&
      !["vacation", "doctor", "sick_day", "other"].includes(reason)
    ) {
      return res.status(400).json({
        status: "error",
        message: "Neplatný důvod",
      });
    }

    if (reason === "other" && !String(note || "").trim()) {
      return res.status(400).json({
        status: "error",
        message: "Pro možnost 'Jiné' vyplňte poznámku",
      });
    }

    if (dateFrom) item.dateFrom = new Date(dateFrom);
    if (dateTo) item.dateTo = new Date(dateTo);
    if (reason) item.reason = reason;
    if (note !== undefined) item.note = String(note || "").trim();

    if (item.dateTo < item.dateFrom) {
      return res.status(400).json({
        status: "error",
        message: "Datum do nemůže být dříve než datum od",
      });
    }

    await item.save();

    // 🔔 notify only admins after user update
    if (currentUserRole !== "admin") {
      await User.updateMany({ role: "admin" }, { $set: { newWeekend: true } });
    }

    return res.json({
      status: "success",
      data: item,
    });
  } catch (error) {
    console.error("Update weekend error:", error);
    return res.status(400).json({
      status: "error",
      message: "Не вдалося оновити запис",
      error: error.message,
    });
  }
};

/* =====================================================
   DELETE
===================================================== */
export const deleteWeekend = async (req, res) => {
  try {
    const currentUser = req.user;
    const currentUserId = currentUser?._id || req.headers["x-user-id"];
    const currentUserRole = currentUser?.role || req.headers["x-user-role"];

    const item = await Weekend.findById(req.params.id);

    if (!item) {
      return res.status(404).json({
        status: "error",
        message: "Запис не знайдено",
      });
    }

    if (
      currentUserRole !== "admin" &&
      item.userId.toString() !== currentUserId?.toString()
    ) {
      return res.status(403).json({
        status: "error",
        message: "Nemáte oprávnění smazat tento záznam",
      });
    }

    await Weekend.findByIdAndDelete(req.params.id);

    return res.json({
      status: "success",
      data: { message: "Запис видалено" },
    });
  } catch (error) {
    console.error("Delete weekend error:", error);
    return res.status(400).json({
      status: "error",
      message: "Не вдалося видалити запис",
      error: error.message,
    });
  }
};

/* =====================================================
   PATCH /weekend/:id/status
   ADMIN ONLY
===================================================== */
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
      { new: true },
    );

    if (!item) {
      return res.status(404).json({
        status: "error",
        message: "Záznam nebyl nalezen",
      });
    }

    // 🔔 notify only request owner
    await User.findByIdAndUpdate(item.userId, {
      newWeekend: true,
    });

    return res.json({
      status: "success",
      data: item,
    });
  } catch (error) {
    console.error("Update weekend status error:", error);
    return res.status(400).json({
      status: "error",
      message: "Nepodařilo se aktualizovat status",
      error: error.message,
    });
  }
};
