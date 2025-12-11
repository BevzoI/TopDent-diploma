import mongoose from 'mongoose';

const weekendSchema = new mongoose.Schema(
  {
    userId: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },

    dateFrom: { type: Date, required: true },
    dateTo: { type: Date, required: true },

    reason: { type: String, trim: true, required: true },
    note: { type: String, trim: true },

    status: {
      type: String,
      enum: ["new", "approved", "rejected"],
      default: "new",
    },
  },
  { timestamps: true }
);

export default mongoose.model("Weekend", weekendSchema);
