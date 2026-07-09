"use client";

import { Clock } from "lucide-react";
import { useSentenceNote } from "@/hooks/use-sentence-note";

export function SentenceNote() {
  const entries = useSentenceNote();

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
        <li key={entry.id} className="rounded-xl border p-4">
          <p className="font-semibold">{entry.text}</p>
          <p className="mt-1 flex items-center gap-1 text-xs text-muted-foreground">
            <Clock className="size-3" />
            {formatTime(entry.savedAt)}
          </p>
        </li>
      ))}
    </ul>
  );
}

function formatTime(ts: number): string {
  return new Date(ts).toLocaleString("ko-KR", {
    dateStyle: "short",
    timeStyle: "short",
  });
}
