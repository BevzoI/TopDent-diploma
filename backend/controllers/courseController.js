import Course from "../models/Course.js";

/* =====================================================
   HELPER – ACCESS
===================================================== */
function hasAccess(course, user) {
  if (!user) return false;

  if (user.role === "admin") return true;

  if (course.publish === "hide") return false;

  if (course.visibility === "all") return true;

  if (
    course.visibility === "users" &&
    Array.isArray(course.specificUsers) &&
    course.specificUsers.some((id) => id.toString() === user._id.toString())
  ) {
    return true;
  }

  if (
    course.visibility === "groups" &&
    Array.isArray(course.specificGroups) &&
    Array.isArray(user.groups)
  ) {
    return course.specificGroups.some((groupId) =>
      user.groups.map((g) => g.toString()).includes(groupId.toString()),
    );
  }

  return false;
}

/* =====================================================
   CREATE COURSE
===================================================== */
export async function createCourse(req, res) {
  try {
    const {
      title,
      description,
      dateTime,
      location,
      publish,
      visibility,
      specificUsers,
      specificGroups,
    } = req.body;

    const item = await Course.create({
      title,
      description: description || "",
      dateTime,
      location: location || "",
      publish: publish || "hide",
      visibility: visibility || "all",
      specificUsers:
        visibility === "users"
          ? Array.isArray(specificUsers)
            ? specificUsers
            : []
          : [],
      specificGroups:
        visibility === "groups"
          ? Array.isArray(specificGroups)
            ? specificGroups
            : []
          : [],
      answers: [],
    });

    return res.json({
      status: "success",
      data: item,
    });
  } catch (error) {
    console.error("Create course error:", error);
    return res.status(500).json({
      status: "error",
      message: "Nepodařilo se vytvořit kurz",
      error: error.message,
    });
  }
}

/* =====================================================
   GET ALL COURSES
===================================================== */
export async function getAllCourses(req, res) {
  try {
    const user = req.user;

    const items = await Course.find()
      .populate("specificUsers", "name email")
      .populate("specificGroups", "name")
      .sort({ dateTime: 1 });

    const filtered = items.filter((course) => hasAccess(course, user));

    return res.json({
      status: "success",
      data: filtered,
    });
  } catch (error) {
    console.error("Get all courses error:", error);
    return res.status(500).json({
      status: "error",
      message: "Nepodařilo se načíst kurzy",
      error: error.message,
    });
  }
}

/* =====================================================
   GET ONE COURSE
===================================================== */
export async function getOneCourse(req, res) {
  try {
    const user = req.user;

    const item = await Course.findById(req.params.id)
      .populate("specificUsers", "name email")
      .populate("specificGroups", "name");

    if (!item) {
      return res.status(404).json({
        status: "error",
        message: "Kurz nebyl nalezen",
      });
    }

    if (!hasAccess(item, user)) {
      return res.status(403).json({
        status: "error",
        message: "Nemáte přístup k tomuto kurzu",
      });
    }

    return res.json({
      status: "success",
      data: item,
    });
  } catch (error) {
    console.error("Get one course error:", error);
    return res.status(500).json({
      status: "error",
      message: "Nepodařilo se načíst kurz",
      error: error.message,
    });
  }
}

/* =====================================================
   UPDATE COURSE
===================================================== */
export async function updateCourse(req, res) {
  try {
    const {
      title,
      description,
      dateTime,
      location,
      publish,
      visibility,
      specificUsers,
      specificGroups,
    } = req.body;

    const updateData = {
      title,
      description: description || "",
      dateTime,
      location: location || "",
      publish: publish || "hide",
      visibility: visibility || "all",
      specificUsers:
        visibility === "users"
          ? Array.isArray(specificUsers)
            ? specificUsers
            : []
          : [],
      specificGroups:
        visibility === "groups"
          ? Array.isArray(specificGroups)
            ? specificGroups
            : []
          : [],
    };

    const item = await Course.findByIdAndUpdate(req.params.id, updateData, {
      new: true,
    })
      .populate("specificUsers", "name email")
      .populate("specificGroups", "name");

    if (!item) {
      return res.status(404).json({
        status: "error",
        message: "Kurz nebyl nalezen",
      });
    }

    return res.json({
      status: "success",
      data: item,
    });
  } catch (error) {
    console.error("Update course error:", error);
    return res.status(500).json({
      status: "error",
      message: "Nepodařilo se upravit kurz",
      error: error.message,
    });
  }
}

/* =====================================================
   DELETE COURSE
===================================================== */
export async function deleteCourse(req, res) {
  try {
    const deleted = await Course.findByIdAndDelete(req.params.id);

    if (!deleted) {
      return res.status(404).json({
        status: "error",
        message: "Kurz nebyl nalezen",
      });
    }

    return res.json({
      status: "success",
    });
  } catch (error) {
    console.error("Delete course error:", error);
    return res.status(500).json({
      status: "error",
      message: "Nepodařilo se smazat kurz",
      error: error.message,
    });
  }
}

/* =====================================================
   ANSWER COURSE
===================================================== */
export async function answerCourse(req, res) {
  try {
    const user = req.user;
    const { value } = req.body;

    if (!["yes", "no"].includes(value)) {
      return res.status(400).json({
        status: "error",
        message: "Neplatná odpověď",
      });
    }

    const item = await Course.findById(req.params.id);

    if (!item) {
      return res.status(404).json({
        status: "error",
        message: "Kurz nebyl nalezen",
      });
    }

    if (!hasAccess(item, user)) {
      return res.status(403).json({
        status: "error",
        message: "Nemáte přístup k tomuto kurzu",
      });
    }

    const existingIndex = item.answers.findIndex(
      (a) => a.userId.toString() === user._id.toString(),
    );

    const answerData = {
      userId: user._id,
      value,
      answeredAt: new Date(),
    };

    if (existingIndex >= 0) {
      item.answers[existingIndex] = answerData;
    } else {
      item.answers.push(answerData);
    }

    await item.save();

    return res.json({
      status: "success",
      data: item,
    });
  } catch (error) {
    console.error("Answer course error:", error);
    return res.status(500).json({
      status: "error",
      message: "Nepodařilo se uložit odpověď",
      error: error.message,
    });
  }
}
