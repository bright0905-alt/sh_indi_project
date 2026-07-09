import type { ForceType, GrammarPoint, LookupResult } from "@/types/study";

/** 학습 조회 API 호출 래퍼 (클라이언트에서 사용). */
export async function lookup(
  text: string,
  forceType?: ForceType,
): Promise<LookupResult> {
  const res = await fetch("/api/lookup", {
    method: "POST",
    headers: { "content-type": "application/json" },
    body: JSON.stringify({ text, forceType }),
  });
  if (!res.ok) {
    throw new Error(`조회 실패 (${res.status})`);
  }
  return (await res.json()) as LookupResult;
}

/** 문장의 문법 설명을 요청한다. */
export async function fetchGrammar(text: string): Promise<GrammarPoint[]> {
  const res = await fetch("/api/grammar", {
    method: "POST",
    headers: { "content-type": "application/json" },
    body: JSON.stringify({ text }),
  });
  if (!res.ok) {
    throw new Error(`문법 분석 실패 (${res.status})`);
  }
  const data = (await res.json()) as { points: GrammarPoint[] };
  return data.points;
}
