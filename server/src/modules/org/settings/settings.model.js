import mongoose from "mongoose";

const settingsSchema = new mongoose.Schema(
  {
    companyName: { type: String, required: true, trim: true },
    officeStart: { type: String, default: "09:00" },
    graceMinutes: { type: Number, default: 15 },
    halfDayHours: { type: Number, default: 5 },
    weekend: { type: [Number], default: [0, 6] }, // 0 = Sunday, 6 = Saturday
    office: {
      lat: { type: Number },
      lng: { type: Number },
      radiusMeters: { type: Number, default: 150 },
    },
  },
  { timestamps: true },
);

export const Settings = mongoose.model("Settings", settingsSchema);
