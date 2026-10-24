import mongoose from "mongoose";

const correctionSchema = new mongoose.Schema(
  {
    employee: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Employee",
      required: true,
    },
    date: { type: String, required: true },
    // Times the employee says are correct, as HH:MM in office time.
    checkIn: { type: String },
    checkOut: { type: String },
    reason: { type: String, required: true, trim: true },
    status: {
      type: String,
      enum: ["pending", "approved", "rejected"],
      default: "pending",
    },
    decidedBy: { type: mongoose.Schema.Types.ObjectId, ref: "User" },
    decidedAt: { type: Date },
    decisionNote: { type: String, trim: true },
  },
  { timestamps: true },
);

// One open request per employee per day.
correctionSchema.index(
  { employee: 1, date: 1 },
  { unique: true, partialFilterExpression: { status: "pending" } },
);
correctionSchema.index({ status: 1, createdAt: -1 });

export const Correction = mongoose.model("Correction", correctionSchema);
