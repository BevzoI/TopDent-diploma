import Group from "../models/Group.js";

export const getAllGroups = async (req, res) => {
  try {
    const groups = await Group.find();
    res.json({ status: "success", groups });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

export const createGroup = async (req, res) => {
  try {
    const { name } = req.body;
    const group = await Group.create({ name });
    res.json({ status: "success", group });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};