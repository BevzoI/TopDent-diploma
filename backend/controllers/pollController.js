import Poll from "../models/Poll.js";
import User from "../models/User.js";

/* =====================================================
   HELPERS
===================================================== */
function getUserId(user) {
  return user?._id?.toString?.() || user?.id?.toString?.() || null;
}

function getUserGroupIds(user) {
  if (!Array.isArray(user?.groups)) return [];

  return user.groups.map((group) => getRefId(group)).filter(Boolean);
}

function getPublishValue(poll) {
  return poll?.publish || "show";
}

function getVisibilityValue(poll) {
  return poll?.visibility || "all";
}

function getRefId(value) {
  if (!value) return null;

  if (typeof value === "string") return value;
  if (value?._id) return value._id.toString();
  if (value?.id) return value.id.toString();
  if (value?.toString) return value.toString();

  return null;
}

function hasAccess(poll, user) {
  if (!user) return false;

  const userId = getUserId(user);
  const userGroupIds = getUserGroupIds(user);
  const publish = getPublishValue(poll);
  const visibility = getVisibilityValue(poll);

  if (user.role === "admin") return true;
  if (publish === "hide") return false;
  if (visibility === "all") return true;

  if (visibility === "users" && Array.isArray(poll.specificUsers) && userId) {
    return poll.specificUsers.some((item) => getRefId(item) === userId);
  }

  if (
    visibility === "groups" &&
    Array.isArray(poll.specificGroups) &&
    userGroupIds.length > 0
  ) {
    return poll.specificGroups.some((groupItem) =>
      userGroupIds.includes(getRefId(groupItem)),
    );
  }

  return false;
}

async function markPollNotifications(poll, authorUser) {
  const authorId = getUserId(authorUser);
  const publish = getPublishValue(poll);
  const visibility = getVisibilityValue(poll);

  if (publish === "hide") return;

  if (visibility === "all") {
    await User.updateMany(authorId ? { _id: { $ne: authorId } } : {}, {
      $set: { newPoll: true },
    });
    return;
  }

  if (visibility === "users") {
    const ids = Array.isArray(poll.specificUsers)
      ? poll.specificUsers.map((item) => getRefId(item)).filter(Boolean)
      : [];

    await User.updateMany(
      {
        _id: {
          $in: ids,
          ...(authorId ? { $ne: authorId } : {}),
        },
      },
      { $set: { newPoll: true } },
    );
    return;
  }

  if (visibility === "groups") {
    const groupIds = Array.isArray(poll.specificGroups)
      ? poll.specificGroups.map((item) => getRefId(item)).filter(Boolean)
      : [];

    await User.updateMany(
      {
        groups: { $in: groupIds },
        ...(authorId ? { _id: { $ne: authorId } } : {}),
      },
      { $set: { newPoll: true } },
    );
  }
}

/* =====================================================
   GET ALL POLLS
===================================================== */
export const getAllPolls = async (req, res) => {
  try {
    const user = req.user;

    const items = await Poll.find()
      .populate("specificUsers", "name email")
      .populate("specificGroups", "name")
      .sort({ createdAt: -1 });

    const filtered = items.filter((poll) => hasAccess(poll, user));

    const userId = getUserId(user);
    if (userId) {
      await User.findByIdAndUpdate(userId, { newPoll: false });
    }

    return res.json({
      status: "success",
      data: filtered,
    });
  } catch (error) {
    console.error("Get all polls error:", error);
    return res.status(500).json({
      status: "error",
      message: "Nepodařilo se načíst dotazníky",
      error: error.message,
    });
  }
};

/* =====================================================
   GET ONE POLL
===================================================== */
export const getOnePoll = async (req, res) => {
  try {
    const user = req.user;

    const item = await Poll.findById(req.params.id)
      .populate("specificUsers", "name email")
      .populate("specificGroups", "name")
      .populate("answers.userId", "name email");

    if (!item) {
      return res.status(404).json({
        status: "error",
        message: "Dotazník nebyl nalezen",
      });
    }

    if (!hasAccess(item, user)) {
      return res.status(403).json({
        status: "error",
        message: "Nemáte přístup k tomuto dotazníku",
      });
    }

    return res.json({
      status: "success",
      data: item,
    });
  } catch (error) {
    console.error("Get one poll error:", error);
    return res.status(400).json({
      status: "error",
      message: "Nepodařilo se načíst dotazník",
      error: error.message,
    });
  }
};

/* =====================================================
   CREATE POLL
===================================================== */
export const createPoll = async (req, res) => {
  try {
    const {
      title,
      description,
      publish,
      visibility,
      specificUsers,
      specificGroups,
      options,
    } = req.body;

    const normalizedOptions = Array.isArray(options)
      ? options.map((option) => String(option).trim()).filter(Boolean)
      : [];

    if (!title?.trim()) {
      return res.status(400).json({
        status: "error",
        message: "Název dotazníku je povinný",
      });
    }

    if (normalizedOptions.length < 2) {
      return res.status(400).json({
        status: "error",
        message: "Dotazník musí mít alespoň 2 možnosti odpovědi",
      });
    }

    if (
      visibility === "users" &&
      (!Array.isArray(specificUsers) || specificUsers.length === 0)
    ) {
      return res.status(400).json({
        status: "error",
        message: "Vyberte alespoň jednoho uživatele",
      });
    }

    if (
      visibility === "groups" &&
      (!Array.isArray(specificGroups) || specificGroups.length === 0)
    ) {
      return res.status(400).json({
        status: "error",
        message: "Vyberte alespoň jednu skupinu",
      });
    }

    const item = await Poll.create({
      title: title.trim(),
      description: description || "",
      publish: publish || "show",
      visibility: visibility || "all",
      specificUsers:
        visibility === "users" && Array.isArray(specificUsers)
          ? specificUsers
          : [],
      specificGroups:
        visibility === "groups" && Array.isArray(specificGroups)
          ? specificGroups
          : [],
      options: normalizedOptions,
      answers: [],
    });

    await markPollNotifications(item, req.user);

    return res.status(201).json({
      status: "success",
      data: item,
    });
  } catch (error) {
    console.error("Create poll error:", error);
    return res.status(400).json({
      status: "error",
      message: "Nepodařilo se vytvořit dotazník",
      error: error.message,
    });
  }
};

/* =====================================================
   UPDATE POLL
===================================================== */
export const updatePoll = async (req, res) => {
  try {
    const {
      title,
      description,
      publish,
      visibility,
      specificUsers,
      specificGroups,
      options,
    } = req.body;

    const normalizedOptions = Array.isArray(options)
      ? options.map((option) => String(option).trim()).filter(Boolean)
      : [];

    if (!title?.trim()) {
      return res.status(400).json({
        status: "error",
        message: "Název dotazníku je povinný",
      });
    }

    if (normalizedOptions.length < 2) {
      return res.status(400).json({
        status: "error",
        message: "Dotazník musí mít alespoň 2 možnosti odpovědi",
      });
    }

    if (
      visibility === "users" &&
      (!Array.isArray(specificUsers) || specificUsers.length === 0)
    ) {
      return res.status(400).json({
        status: "error",
        message: "Vyberte alespoň jednoho uživatele",
      });
    }

    if (
      visibility === "groups" &&
      (!Array.isArray(specificGroups) || specificGroups.length === 0)
    ) {
      return res.status(400).json({
        status: "error",
        message: "Vyberte alespoň jednu skupinu",
      });
    }

    const item = await Poll.findByIdAndUpdate(
      req.params.id,
      {
        title: title.trim(),
        description: description || "",
        publish: publish || "show",
        visibility: visibility || "all",
        specificUsers:
          visibility === "users" && Array.isArray(specificUsers)
            ? specificUsers
            : [],
        specificGroups:
          visibility === "groups" && Array.isArray(specificGroups)
            ? specificGroups
            : [],
        options: normalizedOptions,
      },
      {
        new: true,
        runValidators: true,
      },
    )
      .populate("specificUsers", "name email")
      .populate("specificGroups", "name");

    if (!item) {
      return res.status(404).json({
        status: "error",
        message: "Dotazník nebyl nalezen",
      });
    }

    await markPollNotifications(item, req.user);

    return res.json({
      status: "success",
      data: item,
    });
  } catch (error) {
    console.error("Update poll error:", error);
    return res.status(400).json({
      status: "error",
      message: "Nepodařilo se upravit dotazník",
      error: error.message,
    });
  }
};

/* =====================================================
   ANSWER POLL
===================================================== */
export const answerPoll = async (req, res) => {
  try {
    const user = req.user;
    const userId = getUserId(user);
    const { value } = req.body;

    const poll = await Poll.findById(req.params.id);

    if (!poll) {
      return res.status(404).json({
        status: "error",
        message: "Dotazník nebyl nalezen",
      });
    }

    if (!hasAccess(poll, user)) {
      return res.status(403).json({
        status: "error",
        message: "Nemáte přístup k tomuto dotazníku",
      });
    }

    if (!Array.isArray(poll.options) || !poll.options.includes(value)) {
      return res.status(400).json({
        status: "error",
        message: "Neplatná odpověď",
      });
    }

    const existing = poll.answers.find(
      (answer) => answer.userId.toString() === userId,
    );

    if (existing) {
      existing.value = value;
      existing.answeredAt = new Date();
    } else {
      poll.answers.push({
        userId,
        value,
      });
    }

    await poll.save();

    return res.json({
      status: "success",
      data: poll,
    });
  } catch (error) {
    console.error("Answer poll error:", error);
    return res.status(400).json({
      status: "error",
      message: "Nepodařilo se uložit odpověď",
      error: error.message,
    });
  }
};

/* =====================================================
   DELETE POLL
===================================================== */
export const deletePoll = async (req, res) => {
  try {
    const deleted = await Poll.findByIdAndDelete(req.params.id);

    if (!deleted) {
      return res.status(404).json({
        status: "error",
        message: "Dotazník nebyl nalezen",
      });
    }

    return res.json({
      status: "success",
      data: {
        message: "Dotazník byl smazán",
      },
    });
  } catch (error) {
    console.error("Delete poll error:", error);
    return res.status(400).json({
      status: "error",
      message: "Nepodařilo se smazat dotazník",
      error: error.message,
    });
  }
};
