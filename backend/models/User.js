import mongoose from "mongoose";
import bcrypt from "bcryptjs";

const userSchema = new mongoose.Schema(
  {
    email: {
      type: String,
      required: true,
      unique: true,
      trim: true,
      lowercase: true,
    },

    password: {
      type: String,
      select: false,
    },

    role: {
      type: String,
      enum: ["admin", "user"],
      default: "user",
    },

    avatar: {
      type: String,
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

    groups: [
      {
        type: mongoose.Schema.Types.ObjectId,
        ref: "Group",
      },
    ],

    newChat: { type: Boolean, default: false },
    newNews: { type: Boolean, default: false },
    newPoll: { type: Boolean, default: false },
    newCourse: { type: Boolean, default: false },
    newEvent: { type: Boolean, default: false },
    newWeekend: { type: Boolean, default: false },

    isActive: {
      type: Boolean,
      default: false,
    },
  },
  { timestamps: true }
);

// 🔐 Hash only if password exists
userSchema.pre("save", async function (next) {
  if (!this.password) return next();
  if (!this.isModified("password")) return next();

  this.password = await bcrypt.hash(this.password, 10);
  next();
});

const User = mongoose.model("User", userSchema);

export default User;