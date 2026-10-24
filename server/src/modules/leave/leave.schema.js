import { z } from "zod";

const realDate = z
  .string()
  .regex(/^\d{4}-\d{2}-\d{2}$/, "Date must be YYYY-MM-DD")
  .refine((d) => {
    const t = Date.parse(`${d}T00:00:00Z`);
    return !Number.isNaN(t) && new Date(t).toISOString().slice(0, 10) === d;
  }, "Date does not exist");

export const applyLeaveSchema = z
  .object({
    leaveTypeId: z.string().regex(/^[a-f\d]{24}$/i, "Pick a leave type"),
    startDate: realDate,
    endDate: realDate,
    reason: z
      .string()
      .trim()
      .min(3, "Reason must be at least 3 characters")
      .max(500, "Reason is too long"),
  })
  .refine((o) => o.startDate <= o.endDate, {
    message: "End date must be on or after the start date",
    path: ["endDate"],
  });

export const decisionSchema = z
  .object({
    decision: z.enum(["approved", "rejected"]),
    note: z.string().trim().max(500).optional(),
  })
  .refine((o) => o.decision === "approved" || (o.note && o.note.length >= 3), {
    message: "A comment is required when rejecting",
    path: ["note"],
  });
