import Course from "../models/Course.js";

// CREATE
export const createCourse = async (req, res) => {
  try {
    const item = await Course.create(req.body);

    return res.json({
      status: "success",
      data: item,
    });
  } catch (error) {
    return res.status(500).json({
      status: "error",
      message: "Nepodařilo se vytvořit kurz",
    });
  }
};

// GET ALL
export const getAllCourses = async (req, res) => {
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

    const items = await Course.find(query).sort({ dateTime: 1 });

    return res.json({
      status: "success",
      data: items,
    });
  } catch (error) {
    return res.status(500).json({
      status: "error",
      message: "Nepodařilo se načíst kurzy",
    });
  }
};

// GET ONE
export const getOneCourse = async (req, res) => {
  try {
    const item = await Course.findById(req.params.id);

    if (!item) {
      return res.status(404).json({ status: "error", message: "Kurz nenalezen" });
    }

    return res.json({
      status: "success",
      data: item,
    });
  } catch (error) {
    return res.status(500).json({
      status: "error",
      message: "Chyba při načítání kurzu",
    });
  }
};

// UPDATE
export const updateCourse = async (req, res) => {
  try {
    const item = await Course.findByIdAndUpdate(req.params.id, req.body, {
      new: true,
    });

    return res.json({
      status: "success",
      data: item,
    });
  } catch (error) {
    return res.status(500).json({
      status: "error",
      message: "Nepodařilo se upravit kurz",
    });
  }
};

// DELETE
export const deleteCourse = async (req, res) => {
  try {
    await Course.findByIdAndDelete(req.params.id);

    return res.json({
      status: "success",
      message: "Kurz byl smazán",
    });
  } catch (error) {
    return res.status(500).json({
      status: "error",
      message: "Nepodařilo se smazat kurz",
    });
  }
};

// ANSWER (yes | no)
export const answerCourse = async (req, res) => {
  try {
    const { userId, value } = req.body;
    const { id } = req.params;

    const course = await Course.findById(id);
    if (!course) {
      return res.status(404).json({
        status: "error",
        message: "Kurz nebyl nalezen"
      });
    }

    const existing = course.answers.find(
      (a) => a.userId.toString() === userId
    );

    if (existing) {
      existing.value = value;
      existing.answeredAt = new Date();
    } else {
      course.answers.push({ userId, value });
    }

    await course.save();

    return res.json({
      status: "success",
      data: course,
    });
  } catch (error) {
    return res.status(500).json({
      status: "error",
      message: "Nepodařilo se uložit odpověď",
    });
  }
};
