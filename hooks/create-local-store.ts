"use client";

import * as React from "react";

/**
 * localStorage 백드 모듈 스토어 팩토리. useSyncExternalStore로 구독한다.
 * 단어장·문장 노트 등 목록형 영속 스토어의 공통 로직(load/persist/subscribe)을 담당한다.
 */
export function createLocalStore<T>(key: string) {
  const EMPTY: T[] = [];
  let entries: T[] = load();
  const listeners = new Set<() => void>();

  function load(): T[] {
    if (typeof window === "undefined") return EMPTY;
    try {
      const raw = window.localStorage.getItem(key);
      if (!raw) return [];
      const parsed = JSON.parse(raw);
      return Array.isArray(parsed) ? (parsed as T[]) : [];
    } catch {
      return [];
    }
  }

  function persist() {
    if (typeof window !== "undefined") {
      try {
        window.localStorage.setItem(key, JSON.stringify(entries));
      } catch {
        // 쿼터 초과·프라이빗 모드 등에서 저장 실패해도 앱을 깨뜨리지 않는다.
      }
    }
    listeners.forEach((l) => l());
  }

  function get(): T[] {
    return entries;
  }

  /** 엔트리 목록을 갱신하고 구독자에게 알린다. */
  function set(updater: (prev: T[]) => T[]): void {
    entries = updater(entries);
    persist();
  }

  function subscribe(cb: () => void): () => void {
    listeners.add(cb);
    return () => listeners.delete(cb);
  }

  function useEntries(): T[] {
    return React.useSyncExternalStore(subscribe, get, () => EMPTY);
  }

  return { get, set, useEntries };
}

/** 안정적인 고유 id 생성. */
export function newId(): string {
  const c = globalThis.crypto;
  if (c && "randomUUID" in c) return c.randomUUID();
  return `id-${Date.now()}-${Math.round(Math.random() * 1e9)}`;
}
