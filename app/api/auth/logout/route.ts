import { ok } from "@/lib/api-response";
import { sessionCookieOptions } from "@/lib/auth";

export async function POST() {
  const response = ok({ loggedOut: true });
  response.cookies.set(sessionCookieOptions.name, "", { ...sessionCookieOptions, maxAge: 0 });
  return response;
}
