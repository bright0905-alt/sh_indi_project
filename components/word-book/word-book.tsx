"use client";

import { Clock } from "lucide-react";
import { useWordBook } from "@/hooks/use-word-book";

export function WordBook() {
  const entries = useWordBook();

  if (entries.length === 0) {
    return (
      <div className="rounded-xl border p-10 text-center text-muted-foreground">
        <p className="font-semibold">저장된 단어가 없습니다</p>
      </div>
    );
  }

  return (
    <ul className="grid grid-cols-1 gap-3 @md:grid-cols-2">
      {entries.map((entry) => (
        <li
          key={entry.id}
          className="flex items-center gap-3 rounded-xl border p-4"
        >
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
