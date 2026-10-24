import mongoose from "mongoose";

const leaveTypeSchema = new mongoose.Schema(
  {
    name: { type: String, required: true, trim: true, unique: true },
    daysPerYear: { type: Number, required: true, min: 0, max: 365 },
    isPaid: { type: Boolean, default: true },
  },
  { timestamps: true },
);

export const LeaveType = mongoose.model("LeaveType", leaveTypeSchema);
