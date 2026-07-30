import { NextRequest } from "next/server";
import crypto from "crypto";
import { prisma } from "@/lib/db";
import { emailSchema } from "@/lib/validation";
import { ok, fail, tooManyRequests } from "@/lib/api-response";
import { rateLimit, getClientIp } from "@/lib/rate-limit";
import { sendEmail, passwordResetEmailHtml } from "@/lib/email";

const GENERIC_MESSAGE =
  "If an account exists for that email, we've sent a password reset link.";

export async function POST(request: NextRequest) {
  const ip = getClientIp(request);
  const limit = rateLimit(`forgot-password:${ip}`, 5, 60 * 60 * 1000);
  if (!limit.success) return tooManyRequests();

  const body = await request.json().catch(() => null);
  const parsed = emailSchema.safeParse(body?.email);
  if (!parsed.success) return fail("Enter a valid email address.", 422);

  const email = parsed.data;
  const user = await prisma.user.findUnique({ where: { email } });

  // Always respond the same way whether or not the account exists —
  // otherwise this endpoint becomes an email-enumeration oracle.
  if (!user) return ok({ message: GENERIC_MESSAGE });

  const rawToken = crypto.randomBytes(32).toString("hex");
  const tokenHash = crypto.createHash("sha256").update(rawToken).digest("hex");
  const expiresAt = new Date(Date.now() + 60 * 60 * 1000);

  await prisma.passwordResetToken.create({
    data: { userId: user.id, tokenHash, expiresAt },
  });

  const resetLink = `${process.env.NEXT_PUBLIC_APP_URL}/reset-password?token=${rawToken}`;

  sendEmail({
    to: user.email,
    subject: "Reset your Glimoré password",
    html: passwordResetEmailHtml(user.name, resetLink),
  }).catch(() => {});

  return ok({ message: GENERIC_MESSAGE });
}
