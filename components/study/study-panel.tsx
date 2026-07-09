"use client";

import * as React from "react";
import { Search, Volume2, Repeat } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { useLookup, speak } from "@/hooks/study-actions";
import type { ForceType, LookupResult } from "@/types/study";

function SpeakButton({ text }: { text: string }) {
  return (
    <Button variant="outline" size="sm" onClick={() => speak(text)}>
      <Volume2 /> 발음 듣기
    </Button>
  );
}

export function StudyPanel() {
  const [text, setText] = React.useState("");
  const { result, query, loading, error, run } = useLookup();

  return (
    <div className="mx-auto w-full max-w-3xl space-y-5">
      <div className="flex gap-2">
        <Input
          value={text}
          onChange={(e) => setText(e.target.value)}
          onKeyDown={(e) => {
            if (e.key === "Enter" && !loading) run(text);
          }}
          placeholder="단어, 숙어, 문장을 입력하세요"
          aria-label="검색어 입력"
        />
        <Button onClick={() => run(text)} disabled={loading}>
          <Search /> 검색
        </Button>
      </div>

      {error && <p className="text-sm text-destructive">{error}</p>}

      {result && (
        <ResultCard
          result={result}
          onToggle={(forceType) => run(query, forceType)}
        />
      )}
    </div>
  );
}

function ToggleButton({ onClick }: { onClick: () => void }) {
  return (
    <Button variant="outline" size="sm" onClick={onClick}>
      <Repeat /> 다른 방식으로 보기
    </Button>
  );
}

function ResultCard({
  result,
  onToggle,
}: {
  result: LookupResult;
  onToggle: (forceType: ForceType) => void;
}) {
  if (result.kind === "word" || result.kind === "idiom") {
    return (
      <div className="rounded-xl border p-5">
        <div className="mb-3 flex items-center justify-between">
          <p className="text-xs font-semibold uppercase tracking-wide text-muted-foreground">
            판별됨 · {result.kind === "word" ? "단어" : "숙어"}
          </p>
          <ToggleButton onClick={() => onToggle("sentence")} />
        </div>
        <p className="text-2xl font-bold">{result.term}</p>
        <p className="mt-1 font-semibold">뜻: {result.meanings.join(", ")}</p>
        {result.examples.length > 0 && (
          <ul className="mt-3 space-y-1 border-l-2 pl-3 text-sm italic text-muted-foreground">
            {result.examples.map((ex, i) => (
              <li key={i}>{ex}</li>
            ))}
          </ul>
        )}
        <div className="mt-4 flex items-center gap-3">
          <SpeakButton text={result.term} />
          <span className="text-xs text-muted-foreground">단어장에 저장됨</span>
        </div>
      </div>
    );
  }

  if (result.kind === "sentence") {
    return (
      <div className="rounded-xl border p-5">
        <div className="mb-3 flex items-center justify-between">
          <p className="text-xs font-semibold uppercase tracking-wide text-muted-foreground">
            판별됨 · 문장
          </p>
          <ToggleButton onClick={() => onToggle("dictionary")} />
        </div>
        <p className="text-lg font-semibold">{result.text}</p>
        <p className="mt-2 text-sm text-muted-foreground">
          해석: {result.translation}
        </p>
        <div className="mt-4">
          <SpeakButton text={result.text} />
        </div>
      </div>
    );
  }

  return (
    <div className="rounded-xl border p-6 text-center">
      <p className="font-semibold">검색 결과가 없습니다</p>
      <p className="mt-1 text-xs text-muted-foreground">
        단어장에는 아무 것도 추가되지 않습니다
      </p>
    </div>
  );
}
