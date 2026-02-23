import Announcement from "../models/Announcement.js";
import User from "../models/User.js";

export const createAnnouncement = async (req, res) => {
  try {
    const { title, message, groups } = req.body;

    const announcement = await Announcement.create({
      title,
      message,
      groups,
      createdBy: req.userId,
    });

    // 🔔 Позначити юзерам newNews=true
    await User.updateMany(
      { groups: { $in: groups } },
      { $set: { newNews: true } }
    );

    res.json({ status: "success", announcement });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

export const getMyAnnouncements = async (req, res) => {
  try {
    const user = await User.findById(req.userId);

    const announcements = await Announcement.find({
      groups: { $in: user.groups },
    }).populate("groups");

    res.json({ status: "success", announcements });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};