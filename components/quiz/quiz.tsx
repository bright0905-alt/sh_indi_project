"use client";

import * as React from "react";
import { CheckCircle2, XCircle, ArrowRight } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import type { WordEntry } from "@/hooks/use-word-book";

export type QuizMode = "A" | "B";

function normalize(s: string): string {
  return s.trim().toLowerCase().replace(/\s+/g, " ");
}

export function Quiz({
  mode,
  entries,
  onExit,
}: {
  mode: QuizMode;
  entries: WordEntry[];
  onExit: () => void;
}) {
  const [idx, setIdx] = React.useState(0);
  const [answer, setAnswer] = React.useState("");
  const [checked, setChecked] = React.useState(false);

  const entry = entries[idx];
  if (!entry) return null;

  const prompt =
    mode === "A" ? "다음 단어의 뜻을 입력하세요" : "다음 뜻에 맞는 단어를 입력하세요";
  const question = mode === "A" ? entry.term : entry.meanings.join(", ");
  const correctAnswer = mode === "A" ? entry.meanings.join(", ") : entry.term;

  const isCorrect =
    mode === "A"
      ? entry.meanings.some((m) => normalize(m) === normalize(answer))
      : normalize(entry.term) === normalize(answer);

  const isLast = idx === entries.length - 1;

  function submit() {
    if (!answer.trim()) return;
    setChecked(true);
  }

  function next() {
    if (isLast) {
      onExit();
      return;
    }
    setIdx((i) => i + 1);
    setAnswer("");
    setChecked(false);
  }

  return (
    <div className="mx-auto w-full max-w-3xl space-y-4">
      <div className="flex items-center justify-between">
        <span className="text-xs font-semibold uppercase tracking-wide text-muted-foreground">
          문제 {idx + 1} / {entries.length} · 모드 {mode}
        </span>
        <Button variant="ghost" size="sm" onClick={onExit}>
          그만두기
        </Button>
      </div>

      <div className="rounded-xl border p-6">
        <p className="text-sm text-muted-foreground">{prompt}</p>
        <p className="mt-3 mb-5 text-3xl font-extrabold">{question}</p>

        <Input
          value={answer}
          onChange={(e) => setAnswer(e.target.value)}
          onKeyDown={(e) => {
            if (e.key === "Enter" && !checked) submit();
          }}
          disabled={checked}
          placeholder={mode === "A" ? "뜻을 입력하세요" : "단어를 입력하세요"}
          aria-label="답 입력"
        />

        {!checked ? (
          <Button className="mt-3" onClick={submit}>
            제출
          </Button>
        ) : (
          <div className="mt-4 space-y-4">
            <div className="flex items-start gap-2 rounded-xl border bg-muted/40 p-4">
              {isCorrect ? (
                <CheckCircle2 className="mt-0.5 size-5" />
              ) : (
                <XCircle className="mt-0.5 size-5" />
              )}
              <div>
                <p className="font-bold">{isCorrect ? "정답" : "오답"}</p>
                {!isCorrect && (
                  <p className="mt-0.5 text-sm text-muted-foreground">
                    정답: <span className="font-semibold">{correctAnswer}</span>
                  </p>
                )}
              </div>
            </div>
            <Button variant="outline" size="sm" onClick={next}>
              {isLast ? "완료" : "다음 문제"} <ArrowRight />
            </Button>
          </div>
        )}
      </div>
    </div>
  );
}
