// app/api/submit/route.ts
import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";
import { connectToDatabase } from "../../../lib/mongodb";
import { ObjectId } from "mongodb";
import { sendSMS, normalizePhoneNumber } from "../../../lib/sms";

interface Submission {
  _id?: ObjectId;
  name: string;
  phone: string;
  businessTitle: string;
  address: {
    district?: string;
    mandal?: string;
    area?: string;
  };
  rating: number | null;
  createdAt: Date;
  smsStatus?: {
    ok: boolean;
    response?: unknown;
    sentAt: Date;
  };
  regNo?: string; // ✅ stored reg number for DLT
}

function generateRegNo(seq: string): string {
  // ✅ Shorter, friendly reg number
  return "RBG-" + seq.slice(-5).toUpperCase();
}

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { name, phone, businessTitle, address, rating } = body;

    if (!name || !phone || !businessTitle) {
      return NextResponse.json(
        { error: "Missing required fields" },
        { status: 400 }
      );
    }

    const { db } = await connectToDatabase();
    const collection = db.collection<Submission>("submissions");

    const normalizedPhone = normalizePhoneNumber(String(phone).trim());

    // ✅ Check if SMS was already sent for this phone
    const alreadySent = await collection.findOne({
      phone: normalizedPhone,
      "smsStatus.ok": true,
    });

    const doc: Submission = {
      name: String(name).trim(),
      phone: normalizedPhone,
      businessTitle: String(businessTitle).trim(),
      address: {
        district: String(address?.district ?? "").trim(),
        mandal: String(address?.mandal ?? "").trim(),
        area: String(address?.area ?? "").trim(),
      },
      rating:
        typeof rating === "number" ? Math.max(0, Math.min(5, rating)) : null,
      createdAt: new Date(),
    };

    const result = await collection.insertOne(doc);
    const insertedId = result.insertedId.toString();

    // Generate reg number from ObjectId
    const regNo = generateRegNo(insertedId);

    let smsStatus: Submission["smsStatus"];

    if (!alreadySent) {
      // ✅ Use exact DLT template
      const message = `Dear Member, your reg no:${regNo}.You are registered for FESTGO EVENTS -RBG Palnadu Chapter Launch 21st Sep, 9:30AM @ SNR Convention, NRT. Lunch follows."RBG TEAM palnadu"`;

      const smsRes = await sendSMS(normalizedPhone, message);
      smsStatus = {
        ok: smsRes.ok,
        response: smsRes.providerResponse ?? smsRes.error,
        sentAt: new Date(),
      };
    } else {
      smsStatus = {
        ok: false,
        response: "SMS skipped (already sent for this phone)",
        sentAt: new Date(),
      };
    }

    // ✅ update document with SMS status and regNo
    await collection.updateOne(
      { _id: result.insertedId },
      { $set: { smsStatus, regNo } }
    );

    return NextResponse.json({
      ok: true,
      id: insertedId,
      regNo,
      smsStatus,
    });
  } catch (err) {
    console.error("submit error", err);
    const message = err instanceof Error ? err.message : "Server error";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}

export async function GET() {
  try {
    const { db } = await connectToDatabase();
    const collection = db.collection<Submission>("submissions");

    const rows = await collection
      .find({})
      .sort({ createdAt: -1 })
      .limit(200)
      .toArray();

    const cleaned = rows.map((r) => ({
      id: r._id?.toString() ?? "",
      name: r.name,
      phone: r.phone,
      businessTitle: r.businessTitle,
      regNo: r.regNo ?? "",
      address: {
        district: r.address?.district ?? "",
        mandal: r.address?.mandal ?? "",
        area: r.address?.area ?? "",
      },
      rating: r.rating ?? 0,
      createdAt: r.createdAt ? r.createdAt.toISOString() : null,
      smsStatus: r.smsStatus ?? null,
    }));

    return NextResponse.json({ ok: true, rows: cleaned });
  } catch (err) {
    console.error("fetch error", err);
    const message = err instanceof Error ? err.message : "Server error";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
