import type { ForceType, LookupResult } from "@/types/study";

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
