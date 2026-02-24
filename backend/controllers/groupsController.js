import Group from "../models/Group.js";

// GET ALL GROUPS
export async function getGroups(req, res) {
  try {
    const groups = await Group.find().lean();

    return res.json({
      status: "success",
      data: groups.map((g) => ({
        ...g,
        id: g._id,
      })),
    });
  } catch (error) {
    console.error(error);
    return res.status(500).json({
      status: "error",
      message: "Chyba při načítání skupin.",
    });
  }
}

// CREATE GROUP
export async function createGroup(req, res) {
  try {
    const { name } = req.body;

    if (!name) {
      return res.status(400).json({
        status: "error",
        message: "Název skupiny je povinný.",
      });
    }

    const exists = await Group.findOne({ name });
    if (exists) {
      return res.status(400).json({
        status: "error",
        message: "Skupina již existuje.",
      });
    }

    const group = await Group.create({ name });

    return res.json({
      status: "success",
      data: group,
    });
  } catch (error) {
    console.error(error);
    return res.status(500).json({ status: "error" });
  }
}

// DELETE GROUP
export async function deleteGroup(req, res) {
  try {
    const { id } = req.params;

    await Group.findByIdAndDelete(id);

    return res.json({ status: "success" });
  } catch (error) {
    return res.status(500).json({ status: "error" });
  }
}