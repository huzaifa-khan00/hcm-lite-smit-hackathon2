import { z } from "zod";

export const updateSettingsSchema = z
  .object({
    companyName: z.string().trim().min(2, "Company name is required"),
    officeStart: z
      .string()
      .regex(/^([01]\d|2[0-3]):[0-5]\d$/, "Office start must be HH:MM (24h)"),
    graceMinutes: z.number().int().min(0).max(120),
    halfDayHours: z.number().min(1).max(12),
    weekend: z
      .array(z.number().int().min(0).max(6))
      .max(6)
      .refine(
        (a) => new Set(a).size === a.length,
        "Weekend days must be unique",
      ),
    office: z
      .object({
        lat: z.number().min(-90).max(90),
        lng: z.number().min(-180).max(180),
        radiusMeters: z.number().min(10).max(5000),
      })
      .partial(),
  })
  .partial()
  .refine(
    (o) => Object.keys(o).length > 0,
    "Send at least one field to update",
  );
