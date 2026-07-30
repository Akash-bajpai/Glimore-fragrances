import { NextRequest } from "next/server";
import { prisma } from "@/lib/db";
import { getSession } from "@/lib/auth";
import { addressInputSchema } from "@/lib/validation";
import { ok, unauthorized, fromZodError, serverError } from "@/lib/api-response";

export async function GET() {
  const session = await getSession();
  if (!session) return unauthorized();

  const addresses = await prisma.address.findMany({
    where: { userId: session.userId },
    orderBy: [{ isDefault: "desc" }, { createdAt: "desc" }],
  });
  return ok(addresses);
}

export async function POST(request: NextRequest) {
  try {
    const session = await getSession();
    if (!session) return unauthorized();

    const body = await request.json().catch(() => null);
    const parsed = addressInputSchema.safeParse(body);
    if (!parsed.success) return fromZodError(parsed.error);

    if (parsed.data.isDefault) {
      await prisma.address.updateMany({
        where: { userId: session.userId },
        data: { isDefault: false },
      });
    }

    const address = await prisma.address.create({
      data: { ...parsed.data, userId: session.userId },
    });

    return ok(address, 201);
  } catch (err) {
    return serverError(err);
  }
}
