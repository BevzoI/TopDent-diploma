import User from "../models/User.js";

export async function markNotificationForAllExcept(
  field,
  excludeUserId = null,
) {
  try {
    const query = excludeUserId ? { _id: { $ne: excludeUserId } } : {};

    await User.updateMany(query, {
      [field]: true,
    });
  } catch (error) {
    console.error(`Notification helper error for ${field}:`, error);
  }
}
