import crypto from "crypto";
import { prisma } from "./db";
import { sendEmail, otpEmail, isEmailConfigured } from "./email";

export const OTP_TTL_MINUTES = 10;
export const OTP_MAX_ATTEMPTS = 5;
export const OTP_RESEND_COOLDOWN_SECONDS = 60;

function hmacKey(): string {
  const secret = process.env.AUTH_SECRET;
  if (!secret || secret.length < 16) throw new Error("AUTH_SECRET is missing or too short.");
  return secret;
}

/** HMAC of the code bound to the user, so a leaked DB row can't be brute-forced offline. */
function hashCode(userId: string, code: string): string {
  return crypto.createHmac("sha256", hmacKey()).update(`email-otp:${userId}:${code}`).digest("hex");
}

function generateCode(): string {
  return crypto.randomInt(0, 1_000_000).toString().padStart(6, "0");
}

/**
 * Whether new accounts must verify their email before they can sign in / order.
 * Enforced whenever an email provider can deliver the code. If no provider is configured
 * in production, codes could never arrive, so new accounts are auto-verified (with a log
 * warning) rather than locking every customer out.
 */
export function isEmailVerificationRequired(): boolean {
  return isEmailConfigured();
}

export type IssueResult =
  | { ok: true; sent: boolean }
  | { ok: false; reason: "cooldown"; retryAfterSeconds: number };

/** Creates (or replaces) the user's OTP and emails it. Respects the resend cooldown. */
export async function issueEmailOtp(
  user: { id: string; email: string; name: string },
  opts: { ignoreCooldown?: boolean } = {}
): Promise<IssueResult> {
  const existing = await prisma.emailOtp.findUnique({ where: { userId: user.id } });
  if (existing && !opts.ignoreCooldown) {
    const elapsed = (Date.now() - existing.lastSentAt.getTime()) / 1000;
    if (elapsed < OTP_RESEND_COOLDOWN_SECONDS) {
      return { ok: false, reason: "cooldown", retryAfterSeconds: Math.ceil(OTP_RESEND_COOLDOWN_SECONDS - elapsed) };
    }
  }

  const code = generateCode();
  const data = {
    codeHash: hashCode(user.id, code),
    expiresAt: new Date(Date.now() + OTP_TTL_MINUTES * 60 * 1000),
    attempts: 0,
    lastSentAt: new Date(),
  };
  await prisma.emailOtp.upsert({ where: { userId: user.id }, update: data, create: { userId: user.id, ...data } });

  const mail = otpEmail(user.name, code, OTP_TTL_MINUTES);
  const sent = await sendEmail({ to: user.email, toName: user.name, ...mail });
  return { ok: true, sent };
}

export type VerifyResult =
  | { ok: true }
  | { ok: false; reason: "invalid" | "expired" | "too_many_attempts" | "no_code"; attemptsLeft?: number };

/** Checks a code. Counts failed attempts; burns the code after OTP_MAX_ATTEMPTS. */
export async function verifyEmailOtp(userId: string, code: string): Promise<VerifyResult> {
  const otp = await prisma.emailOtp.findUnique({ where: { userId } });
  if (!otp) return { ok: false, reason: "no_code" };
  if (otp.expiresAt.getTime() < Date.now()) return { ok: false, reason: "expired" };
  if (otp.attempts >= OTP_MAX_ATTEMPTS) return { ok: false, reason: "too_many_attempts" };

  // Count the attempt first (atomic increment) so parallel guesses can't exceed the cap.
  const updated = await prisma.emailOtp.update({
    where: { id: otp.id },
    data: { attempts: { increment: 1 } },
  });
  if (updated.attempts > OTP_MAX_ATTEMPTS) return { ok: false, reason: "too_many_attempts" };

  const expected = Buffer.from(otp.codeHash, "hex");
  const actual = Buffer.from(hashCode(userId, code), "hex");
  const match = expected.length === actual.length && crypto.timingSafeEqual(expected, actual);
  if (!match) {
    const attemptsLeft = OTP_MAX_ATTEMPTS - updated.attempts;
    return attemptsLeft > 0
      ? { ok: false, reason: "invalid", attemptsLeft }
      : { ok: false, reason: "too_many_attempts" };
  }

  await prisma.$transaction([
    prisma.user.update({ where: { id: userId }, data: { emailVerifiedAt: new Date() } }),
    prisma.emailOtp.delete({ where: { id: otp.id } }),
  ]);
  return { ok: true };
}
