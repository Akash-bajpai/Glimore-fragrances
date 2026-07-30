import { NextRequest } from "next/server";
import { prisma } from "@/lib/db";
import { getSession } from "@/lib/auth";
import { addressInputSchema } from "@/lib/validation";
import { ok, unauthorized, notFound, fromZodError, serverError } from "@/lib/api-response";

async function assertOwnership(addressId: string, userId: string) {
  const address = await prisma.address.findUnique({ where: { id: addressId } });
  if (!address || address.userId !== userId) return null;
  return address;
}

export async function PATCH(request: NextRequest, { params }: { params: { id: string } }) {
  try {
    const session = await getSession();
    if (!session) return unauthorized();

    const existing = await assertOwnership(params.id, session.userId);
    if (!existing) return notFound("Address not found.");

    const body = await request.json().catch(() => null);
    const parsed = addressInputSchema.partial().safeParse(body);
    if (!parsed.success) return fromZodError(parsed.error);

    if (parsed.data.isDefault) {
      await prisma.address.updateMany({
        where: { userId: session.userId },
        data: { isDefault: false },
      });
    }

    const updated = await prisma.address.update({
      where: { id: params.id },
      data: parsed.data,
    });

    return ok(updated);
  } catch (err) {
    return serverError(err);
  }
}

export async function DELETE(_request: NextRequest, { params }: { params: { id: string } }) {
  try {
    const session = await getSession();
    if (!session) return unauthorized();

    const existing = await assertOwnership(params.id, session.userId);
    if (!existing) return notFound("Address not found.");

    await prisma.address.delete({ where: { id: params.id } });
    return ok({ deleted: true });
  } catch (err) {
    return serverError(err);
  }
}
