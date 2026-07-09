import { NextResponse } from "next/server";
import { lookupText } from "@/lib/anthropic";
import type { ForceType } from "@/types/study";

export const runtime = "nodejs";

interface LookupBody {
  text?: string;
  forceType?: ForceType;
}

export async function POST(req: Request) {
  let body: LookupBody;
  try {
    body = await req.json();
  } catch {
    return NextResponse.json({ error: "잘못된 요청입니다." }, { status: 400 });
  }

  const text = body.text?.trim();
  if (!text) {
    return NextResponse.json({ error: "입력이 비어 있습니다." }, { status: 400 });
  }

  try {
    const result = await lookupText(text, body.forceType);
    return NextResponse.json(result);
  } catch (err) {
    console.error("[lookup] 조회 실패", err);
    return NextResponse.json({ error: "조회 중 문제가 발생했습니다." }, { status: 502 });
  }
}
