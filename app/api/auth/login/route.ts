import { NextRequest } from "next/server";
import { prisma } from "@/lib/db";
import { verifyPassword, signSessionToken, sessionCookieOptions } from "@/lib/auth";
import { loginSchema } from "@/lib/validation";
import { ok, fail, fromZodError, serverError, tooManyRequests } from "@/lib/api-response";
import { rateLimit, getClientIp } from "@/lib/rate-limit";

const GENERIC_ERROR = "Invalid email or password.";

export async function POST(request: NextRequest) {
  try {
    const ip = getClientIp(request);
    // Deliberately strict — this is the primary brute-force target.
    const limit = rateLimit(`login:${ip}`, 8, 15 * 60 * 1000);
    if (!limit.success) return tooManyRequests("Too many login attempts. Try again shortly.");

    const body = await request.json().catch(() => null);
    if (!body) return fail("Invalid request body.", 400);

    const parsed = loginSchema.safeParse(body);
    if (!parsed.success) return fromZodError(parsed.error);
    const { email, password } = parsed.data;

    const user = await prisma.user.findUnique({ where: { email } });
    if (!user) return fail(GENERIC_ERROR, 401);

    const validPassword = await verifyPassword(password, user.passwordHash);
    if (!validPassword) return fail(GENERIC_ERROR, 401);

    const token = await signSessionToken({ userId: user.id, role: user.role });
    const { passwordHash: _omit, ...safeUser } = user;

    const response = ok(safeUser);
    response.cookies.set(sessionCookieOptions.name, token, sessionCookieOptions);
    return response;
  } catch (err) {
    return serverError(err);
  }
}
