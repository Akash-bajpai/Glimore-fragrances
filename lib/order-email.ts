import { prisma } from "./db";
import { sendEmail, orderConfirmationEmailHtml } from "./email";

const PAYMENT_LABELS: Record<string, string> = {
  COD: "Cash on Delivery",
  UPI: "Paid via UPI",
  CARD: "Paid by card",
  NETBANKING: "Paid via net banking",
  WALLET: "Paid via wallet",
};

/** Loads the order and emails the customer a confirmation. Never throws. */
export async function sendOrderConfirmationEmail(orderId: string): Promise<boolean> {
  try {
    const order = await prisma.order.findUnique({
      where: { id: orderId },
      include: { items: true, user: true, shippingAddress: true },
    });
    if (!order) return false;
    const a = order.shippingAddress;
    const address = a
      ? [a.fullName, a.line1, a.line2, `${a.city}, ${a.state} ${a.pincode}`].filter(Boolean).join(", ")
      : undefined;
    return await sendEmail({
      to: order.user.email,
      toName: order.user.name,
      subject: `Order confirmed — ${order.orderNumber}`,
      html: orderConfirmationEmailHtml({
        name: order.user.name,
        orderNumber: order.orderNumber,
        total: order.total,
        subtotal: order.subtotal,
        shippingCharge: order.shippingCharge,
        taxAmount: order.taxAmount,
        discountAmount: order.discountAmount,
        items: order.items.map((i) => ({ name: i.name, quantity: i.quantity, price: i.price })),
        paymentLabel: PAYMENT_LABELS[order.paymentMethod],
        address,
      }),
    });
  } catch (err) {
    console.error("[email] order confirmation failed:", err);
    return false;
  }
}
