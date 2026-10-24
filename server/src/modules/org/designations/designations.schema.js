import { z } from "zod";

export const designationSchema = z.object({
  title: z.string().trim().min(2, "Designation title is required"),
  department: z
    .string()
    .regex(/^[a-f\d]{24}$/i, "Invalid department id")
    .nullable()
    .optional(),
});
