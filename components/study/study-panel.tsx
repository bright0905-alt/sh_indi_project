"use client";

import * as React from "react";
import { Search } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { lookup } from "@/services/study-client";
import type { LookupResult } from "@/types/study";

export function StudyPanel() {
  const [text, setText] = React.useState("");
  const [result, setResult] = React.useState<LookupResult | null>(null);
  const [loading, setLoading] = React.useState(false);
  const [error, setError] = React.useState<string | null>(null);

  async function handleSearch() {
    const query = text.trim();
    if (!query) return;
    setLoading(true);
    setError(null);
    try {
      const res = await lookup(query);
      setResult(res);
    } catch {
      setError("조회 중 문제가 발생했습니다. 다시 시도해 주세요.");
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="mx-auto w-full max-w-3xl space-y-5">
      <div className="flex gap-2">
        <Input
          value={text}
          onChange={(e) => setText(e.target.value)}
          onKeyDown={(e) => {
            if (e.key === "Enter") handleSearch();
          }}
          placeholder="단어, 숙어, 문장을 입력하세요"
          aria-label="검색어 입력"
        />
        <Button onClick={handleSearch} disabled={loading}>
          <Search /> 검색
        </Button>
      </div>

      {error && <p className="text-sm text-destructive">{error}</p>}

      {result && <ResultCard result={result} />}
    </div>
  );
}

function ResultCard({ result }: { result: LookupResult }) {
  if (result.kind === "word" || result.kind === "idiom") {
    return (
      <div className="rounded-xl border p-5">
        <p className="mb-3 text-xs font-semibold uppercase tracking-wide text-muted-foreground">
          판별됨 · {result.kind === "word" ? "단어" : "숙어"}
        </p>
        <p className="text-2xl font-bold">{result.term}</p>
        <p className="mt-1 font-semibold">뜻: {result.meanings.join(", ")}</p>
        {result.examples.length > 0 && (
          <ul className="mt-3 space-y-1 border-l-2 pl-3 text-sm italic text-muted-foreground">
            {result.examples.map((ex, i) => (
              <li key={i}>{ex}</li>
            ))}
          </ul>
        )}
        <p className="mt-3 text-xs text-muted-foreground">단어장에 저장됨</p>
      </div>
    );
  }

  // 문장·결과 없음은 후속 Task에서 확장한다.
  return null;
}
