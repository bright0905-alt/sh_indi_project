import { describe, it, expect, vi, beforeEach } from "vitest";
import { renderHook, act, waitFor } from "@testing-library/react";
import { useLookup } from "./study-actions";
import { clearWords } from "@/hooks/use-word-book";
import { lookup } from "@/services/study-client";
import type { LookupResult } from "@/types/study";

vi.mock("@/services/study-client", () => ({
  lookup: vi.fn(),
  fetchGrammar: vi.fn(),
}));
const mockedLookup = vi.mocked(lookup);

describe("useLookup — 요청 경쟁 조건 가드", () => {
  beforeEach(() => {
    clearWords();
    window.localStorage.clear();
    mockedLookup.mockReset();
  });

  it("늦게 도착한 이전 요청 응답이 최신 결과를 덮어쓰지 않는다", async () => {
    let resolveSlow!: (r: LookupResult) => void;
    mockedLookup
      .mockImplementationOnce(
        () => new Promise<LookupResult>((res) => (resolveSlow = res)),
      )
      .mockResolvedValueOnce({
        kind: "word",
        term: "banana",
        meanings: ["바나나"],
        examples: ["a banana"],
      });

    const { result } = renderHook(() => useLookup());

    // 첫 요청(apple, 느림) 시작 후 곧바로 둘째 요청(banana, 빠름)
    act(() => {
      void result.current.run("apple");
      void result.current.run("banana");
    });

    await waitFor(() =>
      expect(
        result.current.result?.kind === "word" &&
          result.current.result.term === "banana",
      ).toBe(true),
    );

    // 뒤늦게 apple 응답이 해소돼도 최신(banana) 결과를 유지
    await act(async () => {
      resolveSlow({
        kind: "word",
        term: "apple",
        meanings: ["사과"],
        examples: ["an apple"],
      });
    });

    expect(
      result.current.result?.kind === "word" &&
        result.current.result.term,
    ).toBe("banana");
  });
});
