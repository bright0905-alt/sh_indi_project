"use client";

import { createLocalStore, newId } from "@/hooks/create-local-store";

/** 단어장 항목 (localStorage 영속) */
export interface WordEntry {
  id: string;
  term: string;
  type: "word" | "idiom";
  meanings: string[];
  examples: string[];
  savedAt: number;
}

const store = createLocalStore<WordEntry>("esb.wordbook");

/** 단어/숙어를 저장한다. 같은 표제어가 있으면 검색 시각만 갱신(중복 방지). */
export function addWord(input: {
  term: string;
  type: "word" | "idiom";
  meanings: string[];
  examples: string[];
}): void {
  const key = input.term.trim().toLowerCase();
  const now = Date.now();
  store.set((prev) => {
    const existing = prev.find((e) => e.term.trim().toLowerCase() === key);
    if (existing) {
      return prev.map((e) =>
        e.id === existing.id
          ? { ...e, meanings: input.meanings, examples: input.examples, savedAt: now }
          : e,
      );
    }
    return [{ id: newId(), savedAt: now, ...input }, ...prev];
  });
}

export function removeWord(id: string): void {
  store.set((prev) => prev.filter((e) => e.id !== id));
}

export function clearWords(): void {
  store.set(() => []);
}

/** 단어장 목록을 구독한다. */
export function useWordBook(): WordEntry[] {
  return store.useEntries();
}
