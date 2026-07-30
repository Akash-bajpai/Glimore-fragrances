import { NextRequest } from "next/server";
import { z } from "zod";
import { prisma } from "@/lib/db";
import { getSession } from "@/lib/auth";
import { phoneSchema } from "@/lib/validation";
import { ok, unauthorized, fromZodError, serverError } from "@/lib/api-response";

const schema = z.object({
  name: z.string().trim().min(2).max(100),
  phone: phoneSchema.optional().or(z.literal("")),
});

export async function PATCH(request: NextRequest) {
  try {
    const session = await getSession();
    if (!session) return unauthorized();

    const body = await request.json().catch(() => null);
    const parsed = schema.safeParse(body);
    if (!parsed.success) return fromZodError(parsed.error);

    const user = await prisma.user.update({
      where: { id: session.userId },
      data: { name: parsed.data.name, phone: parsed.data.phone || null },
    });

    const { passwordHash: _omit, ...safeUser } = user;
    return ok(safeUser);
  } catch (err) {
    return serverError(err);
  }
}
