import mongoose from "mongoose";

const userSchema = new mongoose.Schema(
  {
    email: {
      type: String,
      required: true,
      unique: true,
      trim: true,
      lowercase: true,
    },

    // 🔐 Пароль зʼявляється ПІСЛЯ invite
    password: {
      type: String,
      required: false,
      select: false, // 🔥 не віддавати пароль у запитах
    },

    role: {
      type: String,
      enum: ["admin", "user"],
      default: "user",
    },

    avatar: {
      type: String,
      default: null,
    },

    phone: {
      type: String,
      default: "",
    },

    name: {
      type: String,
      trim: true,
      default: "",
    },

    clinic: {
      type: String,
      trim: true,
      default: "",
    },

    birthDate: {
      type: Date,
      default: null,
    },

    // 🔔 Notifications
    newChat: { type: Boolean, default: false },
    newNews: { type: Boolean, default: false },
    newPoll: { type: Boolean, default: false },
    newCourse: { type: Boolean, default: false },
    newEvent: { type: Boolean, default: false },
    newWeekend: { type: Boolean, default: false },

    // ✅ Акаунт активний тільки після створення пароля
    isActive: {
      type: Boolean,
      default: false,
    },
  },
  {
    timestamps: true,
  }
);

/**
 * 🔍 Перевірка: чи активований акаунт
 */
userSchema.methods.isActivated = function () {
  return this.isActive && !!this.password;
};

const User = mongoose.model("User", userSchema);

export default User;
