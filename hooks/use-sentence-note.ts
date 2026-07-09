"use client";

import * as React from "react";

/** 문장에 적용된 문법 항목 */
export interface GrammarPoint {
  title: string;
  explanation: string;
}

/** 문장 노트 항목 (localStorage 영속, 단어장과 독립) */
export interface SentenceEntry {
  id: string;
  text: string;
  translation: string;
  grammar: GrammarPoint[] | null;
  savedAt: number;
}

const STORAGE_KEY = "esb.sentencenote";

let entries: SentenceEntry[] = load();
const listeners = new Set<() => void>();

function load(): SentenceEntry[] {
  if (typeof window === "undefined") return [];
  try {
    const raw = window.localStorage.getItem(STORAGE_KEY);
    return raw ? (JSON.parse(raw) as SentenceEntry[]) : [];
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

/** 문장을 저장한다. 같은 문장이 있으면 저장 시각만 갱신(중복 방지). */
export function addSentence(input: {
  text: string;
  translation: string;
}): void {
  const key = input.text.trim().toLowerCase();
  const now = Date.now();
  const existing = entries.find((e) => e.text.trim().toLowerCase() === key);
  if (existing) {
    entries = entries.map((e) =>
      e.id === existing.id
        ? { ...e, translation: input.translation, savedAt: now }
        : e,
    );
  } else {
    entries = [
      { id: newId(), grammar: null, savedAt: now, ...input },
      ...entries,
    ];
  }
  persist();
}

/** 문장의 문법 설명을 캐시한다. */
export function setGrammar(id: string, grammar: GrammarPoint[]): void {
  entries = entries.map((e) => (e.id === id ? { ...e, grammar } : e));
  persist();
}

export function removeSentence(id: string): void {
  entries = entries.filter((e) => e.id !== id);
  persist();
}

export function clearSentences(): void {
  entries = [];
  persist();
}

function subscribe(cb: () => void): () => void {
  listeners.add(cb);
  return () => listeners.delete(cb);
}

function getSnapshot(): SentenceEntry[] {
  return entries;
}

function getServerSnapshot(): SentenceEntry[] {
  return [];
}

/** 문장 노트 목록을 구독한다. */
export function useSentenceNote(): SentenceEntry[] {
  return React.useSyncExternalStore(subscribe, getSnapshot, getServerSnapshot);
}
