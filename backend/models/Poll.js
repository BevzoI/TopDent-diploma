import mongoose from "mongoose";

const pollSchema = new mongoose.Schema(
  {
    title: { type: String, required: true, trim: true },

    description: {
      type: String,
      trim: true,
      default: "",
    },

    publish: {
      type: String,
      enum: ["show", "hide"],
      default: "hide",
    },

    visibility: {
      type: String,
      enum: ["all", "users", "groups"],
      default: "all",
    },

    specificUsers: [
      {
        type: mongoose.Schema.Types.ObjectId,
        ref: "User",
      },
    ],

    specificGroups: [
      {
        type: mongoose.Schema.Types.ObjectId,
        ref: "Group",
      },
    ],

    options: [
      {
        type: String,
        trim: true,
      },
    ],

    answers: [
      {
        userId: {
          type: mongoose.Schema.Types.ObjectId,
          ref: "User",
          required: true,
        },
        value: {
          type: String,
          required: true,
        },
        answeredAt: {
          type: Date,
          default: Date.now,
        },
      },
    ],
  },
  { timestamps: true },
);

export default mongoose.model("Poll", pollSchema);
