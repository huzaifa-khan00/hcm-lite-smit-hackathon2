import { z } from "zod";

const time = z
  .string()
  .regex(/^([01]\d|2[0-3]):[0-5]\d$/, "Time must be HH:MM (24h)");

const realDate = z
  .string()
  .regex(/^\d{4}-\d{2}-\d{2}$/, "Date must be YYYY-MM-DD")
  .refine((d) => {
    const t = Date.parse(`${d}T00:00:00Z`);
    return !Number.isNaN(t) && new Date(t).toISOString().slice(0, 10) === d;
  }, "Date does not exist");

export const createCorrectionSchema = z
  .object({
    date: realDate,
    checkIn: time.optional(),
    checkOut: time.optional(),
    reason: z
      .string()
      .trim()
      .min(5, "Reason must be at least 5 characters")
      .max(500, "Reason is too long"),
  })
  .refine((o) => o.checkIn || o.checkOut, {
    message: "Send a check-in time, a check-out time, or both",
    path: ["checkIn"],
  });

export const decisionSchema = z
  .object({
    decision: z.enum(["approved", "rejected"]),
    note: z.string().trim().max(500).optional(),
  })
  .refine((o) => o.decision === "approved" || (o.note && o.note.length >= 3), {
    message: "A note is required when rejecting",
    path: ["note"],
  });
