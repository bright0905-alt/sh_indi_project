// 도메인 타입 — 의존성 없음 (types 레이어)

/** 입력 판별 유형 */
export type LookupKind = "word" | "idiom" | "sentence" | "none";

/** 단어/숙어 사전 결과 */
export interface DictionaryResult {
  kind: "word" | "idiom";
  term: string;
  meanings: string[];
  examples: string[];
}

/** 문장 해석 결과 */
export interface SentenceResult {
  kind: "sentence";
  text: string;
  translation: string;
}

/** 결과 없음 */
export interface NoneResult {
  kind: "none";
}

/** 입력 조회 결과 (판별 + 내용) */
export type LookupResult = DictionaryResult | SentenceResult | NoneResult;

/** 강제 판별 유형 — 자동 판별을 수동 전환할 때 사용 */
export type ForceType = "dictionary" | "sentence";

/** 문장에 적용된 문법 항목 */
export interface GrammarPoint {
  title: string;
  explanation: string;
}
