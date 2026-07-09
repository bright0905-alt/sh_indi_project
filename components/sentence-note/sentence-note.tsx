"use client";

import * as React from "react";
import {
  Clock,
  ArrowLeft,
  Volume2,
  GraduationCap,
  Trash2,
  RotateCcw,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog";
import {
  useSentenceNote,
  setGrammar,
  removeSentence,
  clearSentences,
  type SentenceEntry,
} from "@/hooks/use-sentence-note";
import { fetchGrammar, speak } from "@/hooks/study-actions";

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
    <div className="space-y-4">
      <ul className="space-y-3">
        {entries.map((entry) => (
          <li key={entry.id} className="flex items-center gap-3">
            <button
              type="button"
              onClick={() => setSelectedId(entry.id)}
              className="flex-1 rounded-xl border p-4 text-left transition-colors hover:bg-muted"
            >
              <p className="font-semibold">{entry.text}</p>
              <p className="mt-1 flex items-center gap-1 text-xs text-muted-foreground">
                <Clock className="size-3" />
                {formatTime(entry.savedAt)} · 클릭하면 문법 설명 보기
              </p>
            </button>
            <Button
              variant="outline"
              size="icon-sm"
              aria-label={`${entry.text} 삭제`}
              onClick={() => removeSentence(entry.id)}
            >
              <Trash2 />
            </Button>
          </li>
        ))}
      </ul>

      <ResetButton />
    </div>
  );
}

function ResetButton() {
  return (
    <AlertDialog>
      <AlertDialogTrigger asChild>
        <Button variant="outline" size="sm">
          <RotateCcw /> 전체 초기화
        </Button>
      </AlertDialogTrigger>
      <AlertDialogContent>
        <AlertDialogHeader>
          <AlertDialogTitle>전체 초기화</AlertDialogTitle>
          <AlertDialogDescription>
            정말 모든 문장을 삭제하시겠습니까?
          </AlertDialogDescription>
        </AlertDialogHeader>
        <AlertDialogFooter>
          <AlertDialogCancel>취소</AlertDialogCancel>
          <AlertDialogAction onClick={() => clearSentences()}>
            확인
          </AlertDialogAction>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
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
