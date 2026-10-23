import { NextRequest } from "next/server";
import { prisma } from "@/lib/db";
import { emailSchema } from "@/lib/validation";
import { ok, fail, serverError, tooManyRequests } from "@/lib/api-response";
import { rateLimit, getClientIp } from "@/lib/rate-limit";
import { issueEmailOtp, OTP_RESEND_COOLDOWN_SECONDS } from "@/lib/otp";

const GENERIC = "If that email has an unverified account, a new code is on its way.";

export async function POST(request: NextRequest) {
  try {
    const ip = getClientIp(request);
    const limit = rateLimit(`resend-otp:${ip}`, 10, 60 * 60 * 1000);
    if (!limit.success) return tooManyRequests("Too many code requests. Please try again later.");

    const body = await request.json().catch(() => null);
    const parsed = emailSchema.safeParse(body?.email);
    if (!parsed.success) return fail("Enter a valid email address.", 422);
    const email = parsed.data;

    // Per-email cap on top of the 60s cooldown, so one inbox can't be flooded.
    const perEmail = rateLimit(`resend-otp-email:${email}`, 6, 60 * 60 * 1000);
    if (!perEmail.success) return tooManyRequests("Too many codes sent to this email. Please try again in an hour.");

    const user = await prisma.user.findUnique({ where: { email } });
    // Same answer whether or not the account exists (no email enumeration).
    if (!user || user.emailVerifiedAt) {
      return ok({ message: GENERIC, retryAfterSeconds: OTP_RESEND_COOLDOWN_SECONDS });
    }

    const issued = await issueEmailOtp(user);
    if (!issued.ok) {
      return fail(`Please wait ${issued.retryAfterSeconds}s before requesting another code.`, 429, {
        retryAfterSeconds: issued.retryAfterSeconds,
      });
    }
    return ok({ message: GENERIC, retryAfterSeconds: OTP_RESEND_COOLDOWN_SECONDS });
  } catch (err) {
    return serverError(err);
  }
}
