import mongoose from "mongoose";

const newsSchema = new mongoose.Schema(
  {
    title: {
      type: String,
      required: true,
      trim: true,
    },

    text: {
      type: String,
      required: true,
      trim: true,
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

    attachments: [
      {
        url: { type: String, required: true },
        name: { type: String, default: "" },
        type: { type: String, default: "file" },
      },
    ],

    author: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
    },
  },
  { timestamps: true },
);

export default mongoose.models.News || mongoose.model("News", newsSchema);
