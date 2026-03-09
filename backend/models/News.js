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

    /* =========================================
       Viditelnost zprávy
    ========================================= */

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

    /* =========================================
       Přílohy (Cloudinary)
    ========================================= */

    attachments: [
      {
        url: String,
        name: String,
        type: String,
      },
    ],

    /* =========================================
       Autor
    ========================================= */

    author: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
    },
  },
  { timestamps: true }
);

export default mongoose.model("News", newsSchema);