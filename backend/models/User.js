import mongoose from "mongoose";

const userSchema = new mongoose.Schema(
  {
    email: {
      type: String,
      required: true,
      unique: true,
      trim: true,
    },

    password: {
      type: String,
      required: true,
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

    lastWeekendCheck: { type: Date, default: null },
    lastNewsCheck: { type: Date, default: null },
    lastChatCheck: { type: Date, default: null },
  },
  {
    timestamps: true,
  }
);

const User = mongoose.model("User", userSchema);

export default User;
