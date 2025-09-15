// lib/sms.ts
import axios from "axios";

const SMS_HOST = process.env.SMS_HOST;
const SMS_PORT = process.env.SMS_PORT;
const SMS_USERNAME = process.env.SMS_USERNAME;
const SMS_PASSWORD = process.env.SMS_PASSWORD;
const SMS_SENDER = process.env.SMS_SENDER;
const SMS_ENTITY_ID = process.env.SMS_ENTITY_ID ?? "";
const SMS_TEMPLATE_ID = process.env.SMS_TEMPLATE_ID ?? "";
const SMS_TMID = process.env.SMS_TMID ?? "";

if (!SMS_HOST || !SMS_PORT || !SMS_USERNAME || !SMS_PASSWORD || !SMS_SENDER) {
  console.warn(
    "lib/sms.ts: some SMS env vars are missing (SMS_HOST, SMS_PORT, etc.)"
  );
}

/**
 * Normalize a phone number to the provider’s expected format.
 * - If it's a 10-digit Indian local number → "91XXXXXXXXXX"
 * - If it's "+91XXXXXXXXXX" → "91XXXXXXXXXX"
 * - If it’s just digits but not 10, prefix with 91
 */
export function normalizePhoneNumber(raw: string): string {
  if (!raw) return raw;
  let s = String(raw).trim();
  s = s.replace(/\s+/g, "");

  // remove leading 0
  if (s.startsWith("0")) s = s.slice(1);

  // if starts with +91 → remove +
  if (s.startsWith("+91")) return s.slice(1);

  // if 10 digits only → add 91
  if (/^\d{10}$/.test(s)) return `91${s}`;

  // if already starts with 91 and is digits → keep
  if (/^91\d{10}$/.test(s)) return s;

  // fallback: remove leading + if any
  if (s.startsWith("+")) return s.slice(1);

  return s;
}

export type SendSMSResult = {
  ok: boolean;
  providerResponse?: unknown;
  error?: string;
};

/**
 * Send an SMS via configured HTTP API
 */
export async function sendSMS(
  toRaw: string,
  message: string,
  type = 0,
  dlr = 1
): Promise<SendSMSResult> {
  try {
    const to = normalizePhoneNumber(toRaw);

    const base = `http://${SMS_HOST}:${SMS_PORT}/sendsms/bulksms`;
    const params = new URLSearchParams({
      username: SMS_USERNAME ?? "",
      password: SMS_PASSWORD ?? "",
      type: String(type),
      dlr: String(dlr),
      destination: to,
      source: SMS_SENDER ?? "",
      message, // must match DLT template exactly
      entityid: SMS_ENTITY_ID,
      tempid: SMS_TEMPLATE_ID,
      tmid: SMS_TMID,
    });

    const url = `${base}?${params.toString()}`;

    const resp = await axios.get(url, {
      timeout: 10000,
      validateStatus: () => true,
    });

    const data = resp.data;

    // Some providers always return 200, so check response body
    const success =
      typeof data === "string" &&
      (data.startsWith("1701|") || data.includes("submitted"));

    return {
      ok: success,
      providerResponse: data,
    };
  } catch (err) {
    const messageErr = err instanceof Error ? err.message : String(err);
    return { ok: false, error: messageErr };
  }
}
