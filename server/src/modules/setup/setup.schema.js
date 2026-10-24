import { z } from "zod";

export const setupSchema = z.object({
  companyName: z.string().trim().min(2, "Company name is required"),
  name: z.string().trim().min(2, "Admin name is required"),
  email: z.string().trim().toLowerCase().email("Valid email is required"),
  password: z.string().min(8, "Password must be at least 8 characters"),
});
