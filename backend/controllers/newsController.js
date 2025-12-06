import News from '../models/News.js';

// GET all
export const getAllNews = async (req, res) => {
  try {
    const role = req.headers["x-user-role"] || "user";

    // 👇 якщо звичайний користувач → тільки publish: "show"
    const query = role === "admin" ? {} : { publish: "show" };

    const items = await News.find(query).sort({ createdAt: -1 });

    return res.json({
      status: "success",
      data: items,
    });
  } catch (error) {
    return res.status(500).json({
      status: "error",
      message: "Не вдалося отримати новини",
    });
  }
};


// GET one
export const getOneNews = async (req, res) => {
  try {
    const item = await News.findById(req.params.id);

    if (!item) {
      return res.status(404).json({
        status: "error",
        message: "Новину не знайдено",
      });
    }

    return res.json({
      status: "success",
      data: item,
    });
  } catch (error) {
    return res.status(400).json({
      status: "error",
      message: "Не вдалося отримати новину",
    });
  }
};


// POST create
export const createNews = async (req, res) => {
  try {
    const item = await News.create(req.body);

    return res.status(201).json({
      status: "success",
      data: item,
    });
  } catch (error) {
    return res.status(400).json({
      status: "error",
      message: "Не вдалося створити новину",
    });
  }
};

// PATCH update
export const updateNews = async (req, res) => {
  try {
    const item = await News.findByIdAndUpdate(req.params.id, req.body, {
      new: true,
      runValidators: true,
    });

    if (!item) {
      return res.status(404).json({
        status: "error",
        message: "Новину не знайдено",
      });
    }

    return res.json({
      status: "success",
      data: item,
    });
  } catch (error) {
    return res.status(400).json({
      status: "error",
      message: "Не вдалося оновити новину",
    });
  }
};

// DELETE remove
export const deleteNews = async (req, res) => {
  try {
    const deleted = await News.findByIdAndDelete(req.params.id);

    if (!deleted) {
      return res.status(404).json({
        status: "error",
        message: "Новину не знайдено",
      });
    }

    return res.json({
      status: "success",
      data: { message: "Новину видалено" },
    });
  } catch (error) {
    return res.status(400).json({
      status: "error",
      message: "Не вдалося видалити новину",
    });
  }
};
