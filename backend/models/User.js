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
      required: false,
      select: false,
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

/**
 * 🔐 AUTO HASH PASSWORD
 */
userSchema.pre("save", async function (next) {
  if (!this.isModified("password")) return next();

  if (!this.password) return next();

  const salt = await bcrypt.genSalt(10);
  this.password = await bcrypt.hash(this.password, salt);

  next();
});

/**
 * 🔐 PASSWORD CHECK METHOD
 */
userSchema.methods.comparePassword = async function (candidatePassword) {
  return bcrypt.compare(candidatePassword, this.password);
};

const User = mongoose.model("User", userSchema);

export default User;