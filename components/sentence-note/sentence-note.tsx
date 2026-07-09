"use client";

import * as React from "react";
import { Clock, ArrowLeft, Volume2, GraduationCap } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  useSentenceNote,
  setGrammar,
  type SentenceEntry,
} from "@/hooks/use-sentence-note";
import { fetchGrammar } from "@/services/study-client";
import { speak } from "@/services/speech";

export function SentenceNote() {
  const entries = useSentenceNote();
  const [selectedId, setSelectedId] = React.useState<string | null>(null);

  const selected = entries.find((e) => e.id === selectedId) ?? null;
  if (selected) {
    return (
      <SentenceDetail entry={selected} onBack={() => setSelectedId(null)} />
    );
  }

  if (entries.length === 0) {
    return (
      <div className="rounded-xl border p-10 text-center text-muted-foreground">
        <p className="font-semibold">저장된 문장이 없습니다</p>
      </div>
    );
  }

  return (
    <ul className="space-y-3">
      {entries.map((entry) => (
        <li key={entry.id}>
          <button
            type="button"
            onClick={() => setSelectedId(entry.id)}
            className="w-full rounded-xl border p-4 text-left transition-colors hover:bg-muted"
          >
            <p className="font-semibold">{entry.text}</p>
            <p className="mt-1 flex items-center gap-1 text-xs text-muted-foreground">
              <Clock className="size-3" />
              {formatTime(entry.savedAt)} · 클릭하면 문법 설명 보기
            </p>
          </button>
        </li>
      ))}
    </ul>
  );
}

function SentenceDetail({
  entry,
  onBack,
}: {
  entry: SentenceEntry;
  onBack: () => void;
}) {
  const [loading, setLoading] = React.useState(false);
  const [error, setError] = React.useState<string | null>(null);

  React.useEffect(() => {
    if (entry.grammar !== null) return;
    let cancelled = false;
    setLoading(true);
    setError(null);
    fetchGrammar(entry.text)
      .then((points) => {
        if (!cancelled) setGrammar(entry.id, points);
      })
      .catch(() => {
        if (!cancelled) setError("문법 설명을 불러오지 못했습니다.");
      })
      .finally(() => {
        if (!cancelled) setLoading(false);
      });
    return () => {
      cancelled = true;
    };
  }, [entry.id, entry.grammar, entry.text]);

  return (
    <div className="space-y-4">
      <Button variant="outline" size="sm" onClick={onBack}>
        <ArrowLeft /> 목록으로
      </Button>

      <div className="rounded-xl border p-5">
        <p className="text-lg font-semibold">{entry.text}</p>

        <div className="mt-4">
          <p className="text-xs font-bold uppercase tracking-wide text-muted-foreground">
            해석
          </p>
          <p className="mt-1 text-sm">{entry.translation}</p>
        </div>

        <div className="mt-4 rounded-xl border bg-muted/40 p-4">
          <p className="mb-2 flex items-center gap-1 text-xs font-bold uppercase tracking-wide text-muted-foreground">
            <GraduationCap className="size-3.5" /> 문법 설명 (AI 분석)
          </p>
          {loading && <p className="text-sm text-muted-foreground">분석 중…</p>}
          {error && <p className="text-sm text-destructive">{error}</p>}
          {entry.grammar && entry.grammar.length > 0 && (
            <ul className="space-y-2 text-sm">
              {entry.grammar.map((g, i) => (
                <li key={i}>
                  <span className="font-bold">{g.title}:</span> {g.explanation}
                </li>
              ))}
            </ul>
          )}
        </div>

        <div className="mt-4">
          <Button variant="outline" size="sm" onClick={() => speak(entry.text)}>
            <Volume2 /> 발음 듣기
          </Button>
        </div>
      </div>
    </div>
  );
}

function formatTime(ts: number): string {
  return new Date(ts).toLocaleString("ko-KR", {
    dateStyle: "short",
    timeStyle: "short",
  });
}
