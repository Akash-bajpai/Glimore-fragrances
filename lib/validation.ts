import { z } from "zod";

export const emailSchema = z
  .string()
  .trim()
  .toLowerCase()
  .email("Enter a valid email address.")
  .max(254);

export const passwordSchema = z
  .string()
  .min(8, "Password must be at least 8 characters.")
  .max(72, "Password is too long.")
  .regex(/[a-zA-Z]/, "Password must include a letter.")
  .regex(/[0-9]/, "Password must include a number.");

export const phoneSchema = z
  .string()
  .trim()
  .transform((value) => value.replace(/[^0-9+]/g, ""))
  .transform((value) => value.replace(/^\+91/, "").replace(/^91(?=[6-9][0-9]{9}$)/, ""))
  .pipe(z.string().regex(/^[6-9][0-9]{9}$/, "Enter a valid 10-digit Indian mobile number."));

export const pincodeSchema = z
  .string()
  .trim()
  .regex(/^[1-9][0-9]{5}$/, "Enter a valid 6-digit PIN code.");

export const addressInputSchema = z.object({
  type: z.enum(["SHIPPING", "BILLING"]).default("SHIPPING"),
  fullName: z.string().trim().min(2, "Name is too short.").max(100),
  phone: phoneSchema,
  line1: z.string().trim().min(4, "Address is too short.").max(200),
  line2: z.string().trim().max(200).optional().or(z.literal("")),
  city: z.string().trim().min(2).max(100),
  state: z.string().trim().min(2).max(100),
  pincode: pincodeSchema,
  isDefault: z.boolean().optional(),
});

export const signupSchema = z.object({
  name: z.string().trim().min(2, "Name is too short.").max(100),
  email: emailSchema,
  password: passwordSchema,
  phone: phoneSchema.optional(),
});

export const loginSchema = z.object({
  email: emailSchema,
  password: z.string().min(1, "Password is required."),
});
