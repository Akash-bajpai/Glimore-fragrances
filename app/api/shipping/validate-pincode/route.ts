import { NextRequest } from "next/server";
import { validatePincode, estimatedDeliveryDate } from "@/lib/pricing";
import { ok, fail } from "@/lib/api-response";

export async function GET(request: NextRequest) {
  const pincode = request.nextUrl.searchParams.get("pincode") ?? "";
  const { valid, serviceable } = validatePincode(pincode);

  if (!valid) return fail("Enter a valid 6-digit PIN code.", 422);

  return ok({
    pincode,
    serviceable,
    estimatedDelivery: serviceable ? estimatedDeliveryDate(pincode) : null,
  });
}
