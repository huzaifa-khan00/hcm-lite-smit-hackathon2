import { z } from "zod";

const id = z.string().regex(/^[a-f\d]{24}$/i, "Invalid id");
const date = z.string().regex(/^\d{4}-\d{2}-\d{2}$/, "Date must be YYYY-MM-DD");

export const createEmployeeSchema = z.object({
  name: z.string().trim().min(2, "Name is required"),
  email: z.string().trim().toLowerCase().email("Valid email is required"),
  phone: z.string().trim().max(20).optional(),
  department: id.nullable().optional(),
  designation: id.nullable().optional(),
  joiningDate: date,
  role: z.enum(["hr", "employee"]).optional(),
});

export const updateEmployeeSchema = createEmployeeSchema
  .omit({ email: true, role: true })
  .partial()
  .refine(
    (o) => Object.keys(o).length > 0,
    "Send at least one field to update",
  );

export const statusSchema = z.object({ isActive: z.boolean() });
