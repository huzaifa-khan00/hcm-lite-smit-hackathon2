import { z } from "zod";

export const leaveTypeSchema = z.object({
  name: z.string().trim().min(2, "Leave type name is required"),
  daysPerYear: z.number().int().min(0).max(365),
  isPaid: z.boolean().optional(),
});
