import { NextRequest, NextResponse } from "next/server";
import { getClientIp, rateLimit } from "@/lib/rate-limit";
import { scoreCV } from "@/lib/cv-scorer";

export async function POST(req: NextRequest) {
  try {
    const ip = getClientIp(req);
    const limited = await rateLimit(`score:${ip}`, { limit: 10, duration: 3600 });
    if (limited) return limited;

    const formData = await req.formData();
    const file = formData.get("file") as File | null;
    const email = ((formData.get("email") as string) || "").trim().toLowerCase();

    if (!file) {
      return NextResponse.json({ error: "No file uploaded." }, { status: 400 });
    }

    const validTypes = [
      "application/pdf",
      "application/vnd.openxmlformats-officedocument.wordprocessingml.document",
    ];
    if (!validTypes.includes(file.type)) {
      return NextResponse.json({ error: "Only PDF and Word files are supported." }, { status: 400 });
    }
    if (file.size > 5 * 1024 * 1024) {
      return NextResponse.json({ error: "File too large (max 5 MB)." }, { status: 400 });
    }

    const bytes = await file.arrayBuffer();
    const buffer = Buffer.from(bytes);

    const result = await scoreCV({
      buffer,
      fileName: file.name,
      fileType: file.type,
      fileSize: file.size,
      email,
      ip,
    });

    return NextResponse.json(result);
  } catch (err) {
    console.error("Score API error:", err);
    return NextResponse.json({ error: "Something went wrong." }, { status: 500 });
  }
}
