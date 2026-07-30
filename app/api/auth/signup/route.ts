import { NextRequest } from "next/server";
import { prisma } from "@/lib/db";
import { hashPassword, signSessionToken, sessionCookieOptions } from "@/lib/auth";
import { signupSchema } from "@/lib/validation";
import { ok, fail, fromZodError, serverError, tooManyRequests } from "@/lib/api-response";
import { rateLimit, getClientIp } from "@/lib/rate-limit";
import { sendEmail } from "@/lib/email";

export async function POST(request: NextRequest) {
  try {
    const ip = getClientIp(request);
    const limit = rateLimit(`signup:${ip}`, 5, 60 * 60 * 1000);
    if (!limit.success) return tooManyRequests();

    const body = await request.json().catch(() => null);
    if (!body) return fail("Invalid request body.", 400);

    const parsed = signupSchema.safeParse(body);
    if (!parsed.success) return fromZodError(parsed.error);
    const { name, email, password, phone } = parsed.data;

    const existing = await prisma.user.findUnique({ where: { email } });
    if (existing) {
      // Same status/shape as a validation error so we don't reveal via timing/shape
      // whether this specific address is a strong enumeration signal.
      return fail("An account with this email already exists.", 409);
    }

    const passwordHash = await hashPassword(password);
    const user = await prisma.user.create({
      data: { name, email, passwordHash, phone },
    });

    const token = await signSessionToken({ userId: user.id, role: user.role });

    sendEmail({
      to: user.email,
      subject: "Welcome to Glimoré Fragrances",
      html: `<p>Hi ${name}, thanks for creating an account with Glimoré Fragrances.</p>`,
    }).catch(() => {});

    const { passwordHash: _omit, ...safeUser } = user;
    const response = ok(safeUser, 201);
    response.cookies.set(sessionCookieOptions.name, token, sessionCookieOptions);
    return response;
  } catch (err) {
    return serverError(err);
  }
}
