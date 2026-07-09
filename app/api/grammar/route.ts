import { NextResponse } from "next/server";
import { explainGrammar } from "@/lib/anthropic";

export const runtime = "nodejs";

export async function POST(req: Request) {
  let body: { text?: string };
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
    const points = await explainGrammar(text);
    return NextResponse.json({ points });
  } catch (err) {
    console.error("[grammar] 분석 실패", err);
    return NextResponse.json(
      { error: "문법 분석 중 문제가 발생했습니다." },
      { status: 502 },
    );
  }
}
