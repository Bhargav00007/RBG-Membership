// lib/sms.ts
import axios from "axios";

const SMS_API_URL = process.env.SMS_API_URL ?? "https://smslogin.co/v3/api.php";
const SMS_USERNAME = process.env.SMS_USERNAME ?? "";
const SMS_API_KEY = process.env.SMS_API_KEY ?? "";
const SMS_SENDER = process.env.SMS_SENDER ?? "";
const SMS_TEMPLATE_ID = process.env.SMS_TEMPLATE_ID ?? "";

export function normalizePhoneNumber(raw: string): string {
  if (!raw) return raw;
  let s = String(raw).trim();
  s = s.replace(/\s+/g, "");

  if (s.startsWith("0")) s = s.slice(1);
  if (s.startsWith("+91")) return s.slice(1);
  if (/^\d{10}$/.test(s)) return `91${s}`;
  if (/^91\d{10}$/.test(s)) return s;
  if (s.startsWith("+")) return s.slice(1);

  return s;
}

export type SendSMSResult = {
  ok: boolean;
  providerResponse?: unknown;
  error?: string;
};

export async function sendSMS(
  toRaw: string,
  message: string
): Promise<SendSMSResult> {
  try {
    const to = normalizePhoneNumber(toRaw);

    const params = new URLSearchParams({
      username: SMS_USERNAME,
      apikey: SMS_API_KEY,
      senderid: SMS_SENDER,
      mobile: to,
      message,
      templateid: SMS_TEMPLATE_ID,
    });

    const url = `${SMS_API_URL}?${params.toString()}`;

    const resp = await axios.get(url, {
      timeout: 10000,
      validateStatus: () => true,
    });
    const data = resp.data;

    // Success check: provider returns messageID or success text
    const success =
      typeof data === "string" &&
      (data.includes("MessageID") || data.includes("success"));

    return { ok: success, providerResponse: data };
  } catch (err) {
    const messageErr = err instanceof Error ? err.message : String(err);
    return { ok: false, error: messageErr };
  }
}
