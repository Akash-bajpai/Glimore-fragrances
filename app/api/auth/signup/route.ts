import { NextRequest } from "next/server";
import { prisma } from "@/lib/db";
import { hashPassword, signSessionToken, sessionCookieOptions } from "@/lib/auth";
import { signupSchema } from "@/lib/validation";
import { ok, fail, fromZodError, serverError, tooManyRequests } from "@/lib/api-response";
import { rateLimit, getClientIp } from "@/lib/rate-limit";
import { sendEmail, welcomeEmail } from "@/lib/email";
import { issueEmailOtp, isEmailVerificationRequired } from "@/lib/otp";

export async function POST(request: NextRequest) {
  try {
    const ip = getClientIp(request);
    const limit = rateLimit(`signup:${ip}`, 10, 60 * 60 * 1000);
    if (!limit.success) return tooManyRequests();

    const body = await request.json().catch(() => null);
    if (!body) return fail("Invalid request body.", 400);

    const parsed = signupSchema.safeParse(body);
    if (!parsed.success) return fromZodError(parsed.error);
    const { name, email, password, phone } = parsed.data;

    const existingEmail = await prisma.user.findUnique({ where: { email } });
    if (existingEmail) {
      return fail("Email is already registered. Please sign in or use a different email.", 409);
    }

    if (phone) {
      const existingPhone = await prisma.user.findFirst({ where: { phone } });
      if (existingPhone) {
        return fail("Phone number is already registered to another account.", 409);
      }
    }

    const passwordHash = await hashPassword(password);
    const mustVerify = isEmailVerificationRequired();
    if (!mustVerify) {
      console.warn("[signup] No email provider configured - new account auto-verified. Set BREVO_API_KEY + EMAIL_FROM to enable email OTP.");
    }
    const user = await prisma.user.create({
      data: {
        name,
        email,
        passwordHash,
        phone: phone ?? null,
        emailVerifiedAt: mustVerify ? null : new Date(),
      },
    });

    if (mustVerify) {
      // No session until the emailed 6-digit code is confirmed (/api/auth/verify-email).
      const issued = await issueEmailOtp(user, { ignoreCooldown: true });
      return ok(
        {
          requiresVerification: true,
          email: user.email,
          emailSent: issued.ok && issued.sent,
        },
        201
      );
    }

    const token = await signSessionToken({ userId: user.id, role: user.role });
    await sendEmail({ to: user.email, toName: user.name, ...welcomeEmail(user.name) });

    const { passwordHash: _omit, ...safeUser } = user;
    const response = ok({ ...safeUser, requiresVerification: false }, 201);
    response.cookies.set(sessionCookieOptions.name, token, sessionCookieOptions);
    return response;
  } catch (err) {
    return serverError(err);
  }
}
