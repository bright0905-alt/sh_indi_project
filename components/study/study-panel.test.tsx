import { describe, it, expect, vi, beforeEach } from "vitest";
import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { StudyPanel } from "./study-panel";
import { lookup } from "@/services/study-client";
import type { LookupResult } from "@/types/study";

vi.mock("@/services/study-client", () => ({
  lookup: vi.fn(),
}));

const mockedLookup = vi.mocked(lookup);

async function search(term: string) {
  const user = userEvent.setup();
  await user.type(screen.getByLabelText("검색어 입력"), term);
  await user.click(screen.getByRole("button", { name: /검색/ }));
}

describe("StudyPanel — 단어/숙어 검색 (Scenario 1, 2)", () => {
  beforeEach(() => {
    mockedLookup.mockReset();
  });

  it('"apple" 검색 → 뜻과 예문이 표시된다', async () => {
    const result: LookupResult = {
      kind: "word",
      term: "apple",
      meanings: ["사과"],
      examples: ["I ate an apple for breakfast."],
    };
    mockedLookup.mockResolvedValue(result);

    render(<StudyPanel />);
    await search("apple");

    expect(await screen.findByText("apple")).toBeInTheDocument();
    expect(screen.getByText(/사과/)).toBeInTheDocument();
    expect(
      screen.getByText("I ate an apple for breakfast."),
    ).toBeInTheDocument();
  });

  it('"kick the bucket" 검색 → 뜻과 예문이 표시된다', async () => {
    const result: LookupResult = {
      kind: "idiom",
      term: "kick the bucket",
      meanings: ["죽다"],
      examples: ["The old man kicked the bucket last winter."],
    };
    mockedLookup.mockResolvedValue(result);

    render(<StudyPanel />);
    await search("kick the bucket");

    expect(await screen.findByText("kick the bucket")).toBeInTheDocument();
    expect(screen.getByText(/죽다/)).toBeInTheDocument();
    expect(
      screen.getByText("The old man kicked the bucket last winter."),
    ).toBeInTheDocument();
  });
});

describe("StudyPanel — 문장 해석 (Scenario 3)", () => {
  beforeEach(() => {
    mockedLookup.mockReset();
  });

  it('"I go to school every day." 입력 → 한글 해석이 표시된다', async () => {
    const result: LookupResult = {
      kind: "sentence",
      text: "I go to school every day.",
      translation: "나는 매일 학교에 간다.",
    };
    mockedLookup.mockResolvedValue(result);

    render(<StudyPanel />);
    await search("I go to school every day.");

    expect(
      await screen.findByText("I go to school every day."),
    ).toBeInTheDocument();
    expect(screen.getByText(/나는 매일 학교에 간다\./)).toBeInTheDocument();
  });
});

describe("StudyPanel — 수동 전환 (Scenario 4)", () => {
  beforeEach(() => {
    mockedLookup.mockReset();
  });

  it("단어 결과에서 전환 클릭 → 같은 문구의 문장 해석이 표시된다", async () => {
    mockedLookup
      .mockResolvedValueOnce({
        kind: "word",
        term: "fine",
        meanings: ["좋은"],
        examples: ["I am fine."],
      })
      .mockResolvedValueOnce({
        kind: "sentence",
        text: "fine",
        translation: "좋아요",
      });

    const user = userEvent.setup();
    render(<StudyPanel />);
    await search("fine");
    expect(await screen.findByText("fine")).toBeInTheDocument();

    await user.click(screen.getByRole("button", { name: /다른 방식으로 보기/ }));

    expect(await screen.findByText("판별됨 · 문장")).toBeInTheDocument();
    expect(screen.getByText(/좋아요/)).toBeInTheDocument();
    // 전환은 같은 입력 "fine"을 sentence로 재조회한다
    expect(mockedLookup).toHaveBeenNthCalledWith(2, "fine", "sentence");
  });
});

describe("StudyPanel — 결과 없음 (Scenario 6)", () => {
  beforeEach(() => {
    mockedLookup.mockReset();
  });

  it("사전에 없는 입력 → 안내 문구가 표시된다", async () => {
    mockedLookup.mockResolvedValue({ kind: "none" });

    render(<StudyPanel />);
    await search("asdkjqwe");

    expect(await screen.findByText("검색 결과가 없습니다")).toBeInTheDocument();
  });
});
