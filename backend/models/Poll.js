import mongoose from 'mongoose';

const pollSchema = new mongoose.Schema(
  {
    title: { type: String, required: true, trim: true },

    description: {
      type: String,
      trim: true,
      default: ""
    },

    publish: { 
      type: String, 
      enum: ["show", "hide"], 
      default: "hide" 
    },

    users: [
      {
        type: mongoose.Schema.Types.ObjectId,
        ref: "User",
      }
    ],

    answers: [
      {
        userId: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
        value: { type: String, enum: ["yes", "no"], required: true },
        answeredAt: { type: Date, default: Date.now }
      }
    ]
  },
  { timestamps: true }
);

export default mongoose.model("Poll", pollSchema);
