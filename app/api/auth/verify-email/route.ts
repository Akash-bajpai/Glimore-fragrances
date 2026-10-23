import { NextRequest } from "next/server";
import { z } from "zod";
import { prisma } from "@/lib/db";
import { signSessionToken, sessionCookieOptions } from "@/lib/auth";
import { emailSchema } from "@/lib/validation";
import { ok, fail, fromZodError, serverError, tooManyRequests } from "@/lib/api-response";
import { rateLimit, getClientIp } from "@/lib/rate-limit";
import { verifyEmailOtp } from "@/lib/otp";
import { sendEmail, welcomeEmail } from "@/lib/email";

const schema = z.object({
  email: emailSchema,
  code: z.string().trim().regex(/^\d{6}$/, "Enter the 6-digit code from your email."),
});

const MESSAGES = {
  invalid: "That code isn't right. Please check the email and try again.",
  expired: "This code has expired. Tap “Resend code” to get a new one.",
  too_many_attempts: "Too many wrong attempts. Tap “Resend code” to get a new one.",
  no_code: "No active code for this email. Tap “Resend code” to get a new one.",
} as const;

export async function POST(request: NextRequest) {
  try {
    const ip = getClientIp(request);
    const limit = rateLimit(`verify-email:${ip}`, 20, 15 * 60 * 1000);
    if (!limit.success) return tooManyRequests("Too many attempts. Please wait a few minutes.");

    const body = await request.json().catch(() => null);
    const parsed = schema.safeParse(body);
    if (!parsed.success) return fromZodError(parsed.error);
    const { email, code } = parsed.data;

    const user = await prisma.user.findUnique({ where: { email } });
    if (!user) return fail(MESSAGES.no_code, 400);
    if (user.emailVerifiedAt) return fail("This email is already verified. Please sign in.", 409);

    const result = await verifyEmailOtp(user.id, code);
    if (!result.ok) {
      const msg =
        result.reason === "invalid" && result.attemptsLeft !== undefined
          ? `${MESSAGES.invalid} ${result.attemptsLeft} attempt${result.attemptsLeft === 1 ? "" : "s"} left.`
          : MESSAGES[result.reason];
      return fail(msg, 400, { reason: result.reason });
    }

    await sendEmail({ to: user.email, toName: user.name, ...welcomeEmail(user.name) });

    const token = await signSessionToken({ userId: user.id, role: user.role });
    const fresh = await prisma.user.findUniqueOrThrow({ where: { id: user.id } });
    const { passwordHash: _omit, ...safeUser } = fresh;
    const response = ok(safeUser);
    response.cookies.set(sessionCookieOptions.name, token, sessionCookieOptions);
    return response;
  } catch (err) {
    return serverError(err);
  }
}
