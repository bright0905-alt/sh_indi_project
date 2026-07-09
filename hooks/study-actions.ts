"use client";

import * as React from "react";
import { lookup, fetchGrammar } from "@/services/study-client";
import { speak, speakSequence } from "@/services/speech";
import { addWord } from "@/hooks/use-word-book";
import { addSentence } from "@/hooks/use-sentence-note";
import type { ForceType, LookupResult } from "@/types/study";

// 컴포넌트가 services를 직접 참조하지 않도록 hooks 레이어에서 재노출한다.
export { speak, speakSequence, fetchGrammar };

/**
 * 학습 조회 상태를 관리하는 훅. 최신 요청만 반영하도록 시퀀스 가드를 둔다
 * (검색 중 재검색·Enter 연타 시 늦게 도착한 응답이 최신 결과를 덮어쓰지 않는다).
 * 조회 성공 시 단어/숙어는 단어장에, 문장은 문장 노트에 저장한다.
 */
export function useLookup() {
  const [result, setResult] = React.useState<LookupResult | null>(null);
  const [query, setQuery] = React.useState("");
  const [loading, setLoading] = React.useState(false);
  const [error, setError] = React.useState<string | null>(null);
  const seq = React.useRef(0);

  const run = React.useCallback(
    async (term: string, forceType?: ForceType) => {
      const trimmed = term.trim();
      if (!trimmed) return;
      const id = ++seq.current;
      setQuery(trimmed);
      setLoading(true);
      setError(null);
      try {
        const res = await lookup(trimmed, forceType);
        if (id !== seq.current) return; // 더 최근 요청이 있으면 무시
        setResult(res);
        if (res.kind === "word" || res.kind === "idiom") {
          addWord({
            term: res.term,
            type: res.kind,
            meanings: res.meanings,
            examples: res.examples,
          });
        } else if (res.kind === "sentence") {
          addSentence({ text: res.text, translation: res.translation });
        }
      } catch {
        if (id !== seq.current) return;
        setError("조회 중 문제가 발생했습니다. 다시 시도해 주세요.");
      } finally {
        if (id === seq.current) setLoading(false);
      }
    },
    [],
  );

  return { result, query, loading, error, run };
}
