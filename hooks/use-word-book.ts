"use client";

import * as React from "react";

/** 단어장 항목 (localStorage 영속) */
export interface WordEntry {
  id: string;
  term: string;
  type: "word" | "idiom";
  meanings: string[];
  examples: string[];
  savedAt: number;
}

const STORAGE_KEY = "esb.wordbook";

let entries: WordEntry[] = load();
const listeners = new Set<() => void>();

function load(): WordEntry[] {
  if (typeof window === "undefined") return [];
  try {
    const raw = window.localStorage.getItem(STORAGE_KEY);
    return raw ? (JSON.parse(raw) as WordEntry[]) : [];
  } catch {
    return [];
  }
}

function persist() {
  if (typeof window !== "undefined") {
    window.localStorage.setItem(STORAGE_KEY, JSON.stringify(entries));
  }
  listeners.forEach((l) => l());
}

function newId(): string {
  const c = globalThis.crypto;
  if (c && "randomUUID" in c) return c.randomUUID();
  return `id-${Date.now()}-${Math.round(Math.random() * 1e9)}`;
}

/** 단어/숙어를 저장한다. 같은 표제어가 있으면 검색 시각만 갱신(중복 방지). */
export function addWord(input: {
  term: string;
  type: "word" | "idiom";
  meanings: string[];
  examples: string[];
}): void {
  const key = input.term.trim().toLowerCase();
  const now = Date.now();
  const existing = entries.find((e) => e.term.trim().toLowerCase() === key);
  if (existing) {
    entries = entries.map((e) =>
      e.id === existing.id
        ? { ...e, meanings: input.meanings, examples: input.examples, savedAt: now }
        : e,
    );
  } else {
    entries = [{ id: newId(), savedAt: now, ...input }, ...entries];
  }
  persist();
}

export function removeWord(id: string): void {
  entries = entries.filter((e) => e.id !== id);
  persist();
}

export function clearWords(): void {
  entries = [];
  persist();
}

function subscribe(cb: () => void): () => void {
  listeners.add(cb);
  return () => listeners.delete(cb);
}

function getSnapshot(): WordEntry[] {
  return entries;
}

function getServerSnapshot(): WordEntry[] {
  return [];
}

/** 단어장 목록을 구독한다. */
export function useWordBook(): WordEntry[] {
  return React.useSyncExternalStore(subscribe, getSnapshot, getServerSnapshot);
}
