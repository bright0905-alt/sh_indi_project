"use client";

import * as React from "react";
import { Clock, Trash2, RotateCcw, Headphones } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
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
  useWordBook,
  removeWord,
  clearWords,
  type WordEntry,
} from "@/hooks/use-word-book";
import { speakSequence } from "@/services/speech";
import { SPEECH_LANG } from "@/config/study";
import { Quiz, type QuizMode } from "@/components/quiz/quiz";
import { BookOpen } from "lucide-react";

export function WordBook() {
  const entries = useWordBook();
  const [selected, setSelected] = React.useState<Set<string>>(new Set());
  const [quiz, setQuiz] = React.useState<{
    mode: QuizMode;
    entries: WordEntry[];
  } | null>(null);

  // 삭제/초기화로 사라진 id는 선택에서 자동 제거
  const selectedIds = React.useMemo(
    () => new Set([...selected].filter((id) => entries.some((e) => e.id === id))),
    [selected, entries],
  );

  function toggle(id: string, checked: boolean) {
    setSelected((prev) => {
      const next = new Set(prev);
      if (checked) next.add(id);
      else next.delete(id);
      return next;
    });
  }

  function toggleAll(checked: boolean) {
    setSelected(checked ? new Set(entries.map((e) => e.id)) : new Set());
  }

  function readAloud() {
    const chosen = entries.filter((e) => selectedIds.has(e.id));
    const seq: { text: string; lang?: string }[] = [];
    for (const e of chosen) {
      seq.push({ text: e.term, lang: SPEECH_LANG });
      if (e.meanings[0]) seq.push({ text: e.meanings[0], lang: "ko-KR" });
    }
    speakSequence(seq);
  }

  function startQuiz(mode: QuizMode) {
    const chosen = entries.filter((e) => selectedIds.has(e.id));
    if (chosen.length === 0) return;
    setQuiz({ mode, entries: chosen });
  }

  if (quiz) {
    return (
      <Quiz
        mode={quiz.mode}
        entries={quiz.entries}
        onExit={() => setQuiz(null)}
      />
    );
  }

  if (entries.length === 0) {
    return (
      <div className="rounded-xl border p-10 text-center text-muted-foreground">
        <p className="font-semibold">저장된 단어가 없습니다</p>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      <div className="flex flex-wrap items-center gap-3 rounded-xl border bg-muted/40 p-3">
        <label className="flex items-center gap-1.5 text-xs font-semibold">
          <Checkbox
            aria-label="전체 선택"
            checked={selectedIds.size === entries.length && entries.length > 0}
            onCheckedChange={(c) => toggleAll(c === true)}
          />
          전체 선택
        </label>
        <span className="text-xs text-muted-foreground">
          선택 {selectedIds.size}개
        </span>
        <div className="ml-auto flex gap-2">
          <Button
            variant="outline"
            size="sm"
            disabled={selectedIds.size === 0}
            onClick={readAloud}
          >
            <Headphones /> 읽어주기
          </Button>
          <Button
            variant="outline"
            size="sm"
            disabled={selectedIds.size === 0}
            onClick={() => startQuiz("A")}
          >
            <BookOpen /> 퀴즈 A
          </Button>
          <Button
            variant="outline"
            size="sm"
            disabled={selectedIds.size === 0}
            onClick={() => startQuiz("B")}
          >
            <BookOpen /> 퀴즈 B
          </Button>
        </div>
      </div>

      <ul className="grid grid-cols-1 gap-3 @md:grid-cols-2">
        {entries.map((entry) => (
          <WordRow
            key={entry.id}
            entry={entry}
            checked={selectedIds.has(entry.id)}
            onToggle={(c) => toggle(entry.id, c)}
          />
        ))}
      </ul>

      <ResetButton />
    </div>
  );
}

function WordRow({
  entry,
  checked,
  onToggle,
}: {
  entry: WordEntry;
  checked: boolean;
  onToggle: (checked: boolean) => void;
}) {
  return (
    <li className="flex items-center gap-3 rounded-xl border p-4">
      <Checkbox
        aria-label={`${entry.term} 선택`}
        checked={checked}
        onCheckedChange={(c) => onToggle(c === true)}
      />
      <div className="flex-1">
        <p className="text-base font-bold">{entry.term}</p>
        <p className="mt-0.5 flex items-center gap-1 text-xs text-muted-foreground">
          <span className="font-semibold text-foreground">
            {entry.meanings.join(", ")}
          </span>
          <span>·</span>
          <Clock className="size-3" />
          {formatTime(entry.savedAt)}
        </p>
      </div>
      <Button
        variant="outline"
        size="icon-sm"
        aria-label={`${entry.term} 삭제`}
        onClick={() => removeWord(entry.id)}
      >
        <Trash2 />
      </Button>
    </li>
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
            정말 모든 단어를 삭제하시겠습니까?
          </AlertDialogDescription>
        </AlertDialogHeader>
        <AlertDialogFooter>
          <AlertDialogCancel>취소</AlertDialogCancel>
          <AlertDialogAction onClick={() => clearWords()}>확인</AlertDialogAction>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  );
}

function formatTime(ts: number): string {
  return new Date(ts).toLocaleString("ko-KR", {
    dateStyle: "short",
    timeStyle: "short",
  });
}
