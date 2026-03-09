export const isAdmin = (req, res, next) => {
  const role = req.headers["x-user-role"];
  if (role !== "admin") {
    return res.status(403).json({ message: "Access denied" });
  }
  next();
};