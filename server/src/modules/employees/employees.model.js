import mongoose from "mongoose";

const employeeSchema = new mongoose.Schema(
  {
    employeeCode: { type: String, required: true, unique: true },
    name: { type: String, required: true, trim: true },
    email: {
      type: String,
      required: true,
      unique: true,
      lowercase: true,
      trim: true,
    },
    phone: { type: String, trim: true },
    department: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Department",
      default: null,
    },
    designation: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Designation",
      default: null,
    },
    joiningDate: { type: String, required: true },
    isActive: { type: Boolean, default: true },
    user: { type: mongoose.Schema.Types.ObjectId, ref: "User", default: null },
  },
  { timestamps: true },
);

export const Employee = mongoose.model("Employee", employeeSchema);
