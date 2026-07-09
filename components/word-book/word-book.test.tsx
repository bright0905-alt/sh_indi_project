import { describe, it, expect, vi, beforeEach } from "vitest";
import { render, screen, within } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { StudyPanel } from "@/components/study/study-panel";
import { WordBook } from "./word-book";
import { clearWords, addWord } from "@/hooks/use-word-book";
import { lookup } from "@/services/study-client";

vi.mock("@/services/study-client", () => ({ lookup: vi.fn() }));
const mockedLookup = vi.mocked(lookup);

function seed(items: { term: string; meanings: string[] }[]) {
  for (const it of items) {
    addWord({ term: it.term, type: "word", meanings: it.meanings, examples: [] });
  }
}

function App() {
  return (
    <>
      <StudyPanel />
      <div data-testid="wordbook">
        <WordBook />
      </div>
    </>
  );
}

async function searchApple() {
  const user = userEvent.setup();
  await user.clear(screen.getByLabelText("검색어 입력"));
  await user.type(screen.getByLabelText("검색어 입력"), "apple");
  await user.click(screen.getByRole("button", { name: /검색/ }));
}

describe("WordBook — 자동 저장·중복·영속성 (Scenario 1, 2, 7)", () => {
  beforeEach(() => {
    clearWords();
    window.localStorage.clear();
    mockedLookup.mockReset();
    mockedLookup.mockResolvedValue({
      kind: "word",
      term: "apple",
      meanings: ["사과"],
      examples: ["I ate an apple."],
    });
  });

  it("apple 검색 후 단어장에 apple 항목이 나타난다", async () => {
    render(<App />);
    await searchApple();
    const book = screen.getByTestId("wordbook");
    expect(await within(book).findByText("apple")).toBeInTheDocument();
  });

  it("apple 재검색 후에도 항목은 1개로 유지된다 (중복 방지)", async () => {
    render(<App />);
    await searchApple();
    await within(screen.getByTestId("wordbook")).findByText("apple");
    await searchApple();

    const book = screen.getByTestId("wordbook");
    expect(within(book).getAllByText("apple")).toHaveLength(1);
  });

  it("저장 후 localStorage에 유지된다 (새로고침 후에도 남음)", async () => {
    render(<App />);
    await searchApple();
    await within(screen.getByTestId("wordbook")).findByText("apple");

    const raw = window.localStorage.getItem("esb.wordbook");
    expect(raw).toContain("apple");
  });
});

describe("WordBook — 삭제·전체 초기화 (Scenario 8, 9)", () => {
  beforeEach(() => {
    clearWords();
    window.localStorage.clear();
    mockedLookup.mockReset();
  });

  it("삭제 클릭 → 해당 항목이 목록에서 사라진다", async () => {
    seed([
      { term: "apple", meanings: ["사과"] },
      { term: "banana", meanings: ["바나나"] },
    ]);
    const user = userEvent.setup();
    render(<WordBook />);

    expect(screen.getByText("apple")).toBeInTheDocument();
    await user.click(screen.getByRole("button", { name: "apple 삭제" }));

    expect(screen.queryByText("apple")).not.toBeInTheDocument();
    expect(screen.getByText("banana")).toBeInTheDocument();
  });

  it("전체 초기화 확인 → 빈 상태가 되고, 취소 시 유지된다", async () => {
    seed([
      { term: "apple", meanings: ["사과"] },
      { term: "banana", meanings: ["바나나"] },
    ]);
    const user = userEvent.setup();
    render(<WordBook />);

    // 취소: 목록 유지
    await user.click(screen.getByRole("button", { name: /전체 초기화/ }));
    await user.click(await screen.findByRole("button", { name: "취소" }));
    expect(screen.getByText("apple")).toBeInTheDocument();

    // 확인: 전부 삭제
    await user.click(screen.getByRole("button", { name: /전체 초기화/ }));
    await user.click(await screen.findByRole("button", { name: "확인" }));
    expect(await screen.findByText("저장된 단어가 없습니다")).toBeInTheDocument();
  });
});
