import { NextRequest } from "next/server";
import crypto from "crypto";
import { z } from "zod";
import { prisma } from "@/lib/db";
import { passwordSchema } from "@/lib/validation";
import { hashPassword } from "@/lib/auth";
import { ok, fail, fromZodError, serverError, tooManyRequests } from "@/lib/api-response";
import { rateLimit, getClientIp } from "@/lib/rate-limit";

const schema = z.object({
  token: z.string().min(10),
  password: passwordSchema,
});

export async function POST(request: NextRequest) {
  try {
    const ip = getClientIp(request);
    const limit = rateLimit(`reset-password:${ip}`, 10, 60 * 60 * 1000);
    if (!limit.success) return tooManyRequests();

    const body = await request.json().catch(() => null);
    const parsed = schema.safeParse(body);
    if (!parsed.success) return fromZodError(parsed.error);

    const tokenHash = crypto.createHash("sha256").update(parsed.data.token).digest("hex");

    const resetToken = await prisma.passwordResetToken.findUnique({ where: { tokenHash } });

    if (
      !resetToken ||
      resetToken.usedAt ||
      resetToken.expiresAt.getTime() < Date.now()
    ) {
      return fail("This reset link is invalid or has expired.", 400);
    }

    const passwordHash = await hashPassword(parsed.data.password);

    await prisma.$transaction([
      prisma.user.update({ where: { id: resetToken.userId }, data: { passwordHash } }),
      prisma.passwordResetToken.update({
        where: { id: resetToken.id },
        data: { usedAt: new Date() },
      }),
    ]);

    return ok({ message: "Password updated. You can now sign in." });
  } catch (err) {
    return serverError(err);
  }
}
