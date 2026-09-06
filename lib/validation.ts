import { z } from "zod";

/**
 * Normalizes Indian phone numbers into a canonical 10-digit string.
 * Handles formats like:
 *   "+91 98765 43210" -> "9876543210"
 *   "+919876543210"   -> "9876543210"
 *   "919876543210"    -> "9876543210"
 *   "09876543210"     -> "9876543210"
 *   "9876543210"      -> "9876543210"
 *   "  "              -> undefined
 */
export const normalizePhone = (val: unknown): string | undefined => {
  if (typeof val !== "string") return undefined;
  let s = val.trim();
  if (!s) return undefined;
  s = s.replace(/[^\d+]/g, "");
  if (s.startsWith("+")) {
    s = s.slice(1);
  }
  if (s.length === 12 && s.startsWith("91")) {
    s = s.slice(2);
  } else if (s.length === 11 && s.startsWith("0")) {
    s = s.slice(1);
  }
  return s;
};

export const phoneSchema = z
  .preprocess((val) => normalizePhone(val), z.string().optional())
  .refine(
    (s) => s === undefined || /^[6-9][0-9]{9}$/.test(s),
    {
      message: "Enter a valid 10-digit Indian mobile number (e.g. 9876543210 or +91 98765 43210).",
    }
  );

export const phoneSchemaRequired = z
  .preprocess((val) => normalizePhone(val) ?? "", z.string().min(1, "Phone number is required"))
  .refine(
    (s) => /^[6-9][0-9]{9}$/.test(s),
    {
      message: "Enter a valid 10-digit Indian mobile number (e.g. 9876543210 or +91 98765 43210).",
    }
  );

/**
 * Normalizes and validates email addresses.
 */
export const normalizedEmail = z
  .string()
  .trim()
  .toLowerCase()
  .email("Enter a valid email address");

export const emailSchema = normalizedEmail;

/**
 * Cleans noise characters from pasted password strings.
 */
const stripPasswordNoise = (val: unknown) => {
  if (typeof val !== "string") return val;
  return val.replace(/[\u2022\u25CF\u25AA\u25AB\u00B7\u2027\uFEFF\u200B]/g, "").trim();
};

export const cleanPassword = z.preprocess(
  stripPasswordNoise,
  z.string().min(8, "Password must be at least 8 characters")
);

export const passwordSchema = cleanPassword;

export const passwordPairSchema = z
  .object({
    password: cleanPassword,
    confirmPassword: cleanPassword,
  })
  .refine((data) => data.password === data.confirmPassword, {
    message: "Passwords do not match",
    path: ["confirmPassword"],
  });

export const signupSchema = z
  .object({
    name: z.string().trim().min(1, "Name is required"),
    email: normalizedEmail,
    phone: phoneSchema,
  })
  .merge(passwordPairSchema);

export const loginSchema = z.object({
  email: normalizedEmail,
  password: cleanPassword,
});

export const addressInputSchema = z.object({
  fullName: z.string().trim().min(1, "Full name is required"),
  phone: phoneSchemaRequired,
  line1: z.string().trim().min(1, "Address line 1 is required"),
  line2: z.string().trim().optional(),
  city: z.string().trim().min(1, "City is required"),
  state: z.string().trim().min(1, "State is required"),
  pincode: z
    .string()
    .trim()
    .refine((s) => /^[1-9][0-9]{5}$/.test(s), {
      message: "Enter a valid 6-digit Indian PIN code",
    }),
  isDefault: z.boolean().optional(),
});