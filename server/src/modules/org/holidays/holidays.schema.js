import { z } from "zod";

const isRealDate = (v) => {
  const d = new Date(`${v}T00:00:00Z`);
  return !Number.isNaN(d.getTime()) && d.toISOString().slice(0, 10) === v;
};

export const holidaySchema = z.object({
  name: z.string().trim().min(2, "Holiday name is required"),
  date: z
    .string()
    .regex(/^\d{4}-\d{2}-\d{2}$/, "Date must be YYYY-MM-DD")
    .refine(isRealDate, "Date is not a real calendar date"),
});
