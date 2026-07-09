"use client";

import { Clock, Trash2, RotateCcw } from "lucide-react";
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
import { useWordBook, removeWord, clearWords } from "@/hooks/use-word-book";

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
    <div className="space-y-4">
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
            <Button
              variant="outline"
              size="icon-sm"
              aria-label={`${entry.term} 삭제`}
              onClick={() => removeWord(entry.id)}
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
