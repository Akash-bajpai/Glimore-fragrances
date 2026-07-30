import { getCurrentUser } from "@/lib/auth";
import { ok } from "@/lib/api-response";

export async function GET() {
  const user = await getCurrentUser();
  return ok({ user });
}
