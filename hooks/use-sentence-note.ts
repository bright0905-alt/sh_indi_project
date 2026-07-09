"use client";

import { createLocalStore, newId } from "@/hooks/create-local-store";
import type { GrammarPoint } from "@/types/study";

export type { GrammarPoint };

/** 문장 노트 항목 (localStorage 영속, 단어장과 독립) */
export interface SentenceEntry {
  id: string;
  text: string;
  translation: string;
  grammar: GrammarPoint[] | null;
  savedAt: number;
}

const store = createLocalStore<SentenceEntry>("esb.sentencenote");

/** 문장을 저장한다. 같은 문장이 있으면 저장 시각만 갱신(중복 방지). */
export function addSentence(input: { text: string; translation: string }): void {
  const key = input.text.trim().toLowerCase();
  const now = Date.now();
  store.set((prev) => {
    const existing = prev.find((e) => e.text.trim().toLowerCase() === key);
    if (existing) {
      return prev.map((e) =>
        e.id === existing.id
          ? { ...e, translation: input.translation, savedAt: now }
          : e,
      );
    }
    return [{ id: newId(), grammar: null, savedAt: now, ...input }, ...prev];
  });
}

/** 문장의 문법 설명을 캐시한다. */
export function setGrammar(id: string, grammar: GrammarPoint[]): void {
  store.set((prev) => prev.map((e) => (e.id === id ? { ...e, grammar } : e)));
}

export function removeSentence(id: string): void {
  store.set((prev) => prev.filter((e) => e.id !== id));
}

export function clearSentences(): void {
  store.set(() => []);
}

/** 문장 노트 목록을 구독한다. */
export function useSentenceNote(): SentenceEntry[] {
  return store.useEntries();
}
