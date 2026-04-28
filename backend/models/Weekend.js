import mongoose from "mongoose";

const weekendSchema = new mongoose.Schema(
  {
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },

    dateFrom: {
      type: Date,
      required: true,
    },

    dateTo: {
      type: Date,
      required: true,
    },

    reason: {
      type: String,
      enum: ["vacation", "doctor", "sick_day", "other"],
      required: true,
    },

    note: {
      type: String,
      trim: true,
      default: "",
    },

    status: {
      type: String,
      enum: ["new", "approved", "rejected"],
      default: "new",
    },
  },
  { timestamps: true },
);

export default mongoose.model("Weekend", weekendSchema);
