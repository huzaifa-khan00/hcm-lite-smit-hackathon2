import mongoose from 'mongoose';

const designationSchema = new mongoose.Schema(
  {
    title: { type: String, required: true, trim: true, unique: true },
    department: { type: mongoose.Schema.Types.ObjectId, ref: 'Department', default: null },
  },
  { timestamps: true }
);

export const Designation = mongoose.model('Designation', designationSchema);
