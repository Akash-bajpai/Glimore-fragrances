import assert from "node:assert/strict";
import fs from "node:fs";
import { signupSchema, phoneSchema } from "../lib/validation";
import { paiseToRupees, rupeesToPaise } from "../lib/razorpay";

assert.equal(phoneSchema.parse("+91 73938 06011"), "7393806011");
assert.equal(phoneSchema.parse("919876543210"), "9876543210");
assert.equal(phoneSchema.parse("98765-43210"), "9876543210");
assert.equal(
  signupSchema.safeParse({
    name: "Akash Bajpai",
    email: "akash@example.com",
    phone: "+91 73938 06011",
    password: "glimore123",
  }).success,
  true,
);
assert.equal(phoneSchema.safeParse("+91 12345 67890").success, false);

const catalog = fs.readFileSync("data/products.ts", "utf8");
const references = [...catalog.matchAll(/['\"](\/images\/products\/[^'\"]+)/g)].map((match) => match[1]);
for (const reference of new Set(references)) {
  assert.equal(fs.existsSync(`public${reference}`), true, `Missing product asset: ${reference}`);
}

assert.equal(rupeesToPaise(250), 25000);
assert.equal(paiseToRupees(25000), 250);

const orderRoute = fs.readFileSync("app/api/orders/create/route.ts", "utf8");
const verifyRoute = fs.readFileSync("app/api/payment/verify/route.ts", "utf8");
const webhookRoute = fs.readFileSync("app/api/payment/webhook/route.ts", "utf8");
assert.match(orderRoute, /RAZORPAY_KEY_SECRET/);
assert.match(orderRoute, /NEXT_PUBLIC_RAZORPAY_KEY_ID/);
assert.match(verifyRoute, /verifyPaymentSignature/);
assert.match(verifyRoute, /status: "PENDING"/);
assert.match(webhookRoute, /verifyWebhookSignature/);
assert.match(webhookRoute, /status: "PENDING"/);

console.log(`Verified ${new Set(references).size} catalog image paths, phone normalization, and payment safeguards.`);
