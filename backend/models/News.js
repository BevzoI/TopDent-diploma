import mongoose from 'mongoose';

const newsSchema = new mongoose.Schema(
  {
    title: { type: String, required: true, trim: true },
    text: { type: String, required: true, trim: true },
    publish: { type: String, enum: ['show', 'hide'], default: 'hide' },
  },
  { timestamps: true }
);

export default mongoose.model('News', newsSchema);
