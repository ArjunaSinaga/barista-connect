import crypto from "crypto";

export const VERIFY_PRODUCTS = {
  verified_barista: { amount: 49000, label: "Centang Biru Barista" },
  verified_owner: { amount: 79000, label: "Centang Biru Owner" },
};

export const QRIS_EXPIRY_MINUTES = 10;

export function midtransConfigured() {
  return Boolean(process.env.MIDTRANS_SERVER_KEY);
}

function baseUrl() {
  return process.env.MIDTRANS_IS_PRODUCTION === "true"
    ? "https://api.midtrans.com"
    : "https://api.sandbox.midtrans.com";
}

function authHeader() {
  return (
    "Basic " + Buffer.from(process.env.MIDTRANS_SERVER_KEY + ":").toString("base64")
  );
}

export async function createQrisCharge({ orderId, amount }) {
  const res = await fetch(`${baseUrl()}/v2/charge`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Accept: "application/json",
      Authorization: authHeader(),
    },
    body: JSON.stringify({
      payment_type: "qris",
      transaction_details: { order_id: orderId, gross_amount: amount },
      custom_expiry: {
        expiry_duration: QRIS_EXPIRY_MINUTES,
        unit: "minute",
      },
    }),
    cache: "no-store",
  });
  const data = await res.json();
  if (!res.ok) {
    throw new Error(data?.status_message || "Midtrans charge gagal");
  }
  const qrUrl = (data.actions ?? []).find((a) => a.name === "generate-qr-code")?.url ?? null;
  return { qrString: data.qr_string ?? null, qrUrl, expireTime: data.expire_time ?? null };
}

export async function getTransactionStatus(orderId) {
  const res = await fetch(`${baseUrl()}/v2/${encodeURIComponent(orderId)}/status`, {
    headers: { Accept: "application/json", Authorization: authHeader() },
    cache: "no-store",
  });
  const data = await res.json();
  if (!res.ok) throw new Error(data?.status_message || "Status check gagal");
  return data; // transaction_status: pending | settlement | expire | deny | cancel
}

export function verifySignature({ orderId, statusCode, grossAmount, signatureKey }) {
  if (!orderId || !statusCode || !grossAmount || !signatureKey) return false;
  const expected = crypto
    .createHash("sha512")
    .update(`${orderId}${statusCode}${grossAmount}${process.env.MIDTRANS_SERVER_KEY}`)
    .digest("hex");
  const a = Buffer.from(expected, "hex");
  const b = Buffer.from(String(signatureKey), "hex");
  if (a.length !== b.length) return false;
  return crypto.timingSafeEqual(a, b);
}
