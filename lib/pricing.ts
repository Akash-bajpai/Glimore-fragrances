import type { Coupon } from "@prisma/client";

/**
 * All amounts are whole rupees. This module is the SINGLE source of truth for
 * order totals — the checkout summary API and the order-creation API both call
 * these same functions against server-loaded product prices. The client never
 * gets to dictate a total; if it tries, it's ignored.
 */

export const FREE_SHIPPING_THRESHOLD = 1999;
export const STANDARD_SHIPPING_CHARGE = 99;
export const GST_RATE = 0.18;

export interface PricedLine {
  productId: string;
  name: string;
  image: string;
  price: number; // server-loaded price at the time of calculation
  quantity: number;
}

export function calculateSubtotal(lines: PricedLine[]): number {
  return lines.reduce((sum, l) => sum + l.price * l.quantity, 0);
}

export function calculateShipping(subtotal: number, serviceable: boolean): number {
  if (!serviceable) return 0; // order should be blocked upstream if unserviceable
  if (subtotal === 0) return 0;
  return subtotal >= FREE_SHIPPING_THRESHOLD ? 0 : STANDARD_SHIPPING_CHARGE;
}

export function calculateDiscount(subtotal: number, coupon: Coupon | null): number {
  if (!coupon) return 0;
  if (!coupon.isActive) return 0;
  if (coupon.expiresAt && coupon.expiresAt.getTime() < Date.now()) return 0;
  if (coupon.usageLimit !== null && coupon.usedCount >= coupon.usageLimit) return 0;
  if (subtotal < coupon.minOrderValue) return 0;

  let discount =
    coupon.discountType === "PERCENT"
      ? Math.round((subtotal * coupon.discountValue) / 100)
      : coupon.discountValue;

  if (coupon.maxDiscount !== null) discount = Math.min(discount, coupon.maxDiscount);
  return Math.min(discount, subtotal);
}

export function calculateTax(taxableAmount: number): number {
  return Math.round(Math.max(0, taxableAmount) * GST_RATE);
}

export interface OrderPricing {
  subtotal: number;
  discountAmount: number;
  shippingCharge: number;
  taxAmount: number;
  total: number;
}

export function calculateOrderPricing(
  lines: PricedLine[],
  coupon: Coupon | null,
  serviceable: boolean
): OrderPricing {
  const subtotal = calculateSubtotal(lines);
  const discountAmount = calculateDiscount(subtotal, coupon);
  const shippingCharge = calculateShipping(subtotal - discountAmount, serviceable);
  const taxAmount = calculateTax(subtotal - discountAmount);
  const total = subtotal - discountAmount + shippingCharge + taxAmount;

  return { subtotal, discountAmount, shippingCharge, taxAmount, total };
}

export function estimatedDeliveryDate(pincode: string): Date {
  // Placeholder heuristic — swap for a real courier partner's promise-date API
  // (Shiprocket / Delhivery / India Post) for production accuracy.
  const isMetro = ["110", "400", "560", "600", "700", "500", "122"].some((p) =>
    pincode.startsWith(p)
  );
  const days = isMetro ? 3 : 6;
  const date = new Date();
  date.setDate(date.getDate() + days);
  return date;
}

/**
 * Format-level PIN code validation + a serviceability simulation.
 * Swap `isServiceable` for a real courier partner API call in production —
 * this only validates shape and excludes a couple of illustrative ranges.
 */
export function validatePincode(pincode: string): { valid: boolean; serviceable: boolean } {
  const valid = /^[1-9][0-9]{5}$/.test(pincode);
  if (!valid) return { valid: false, serviceable: false };
  // Illustrative "not currently serviceable" range — remove once a real
  // courier serviceability API is wired in.
  const unserviceable = pincode.startsWith("799"); // e.g. parts of NE India, illustrative only
  return { valid: true, serviceable: !unserviceable };
}
