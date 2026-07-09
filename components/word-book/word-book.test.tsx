import { describe, it, expect, vi, beforeEach } from "vitest";
import { render, screen, within } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { StudyPanel } from "@/components/study/study-panel";
import { WordBook } from "./word-book";
import { clearWords } from "@/hooks/use-word-book";
import { lookup } from "@/services/study-client";

vi.mock("@/services/study-client", () => ({ lookup: vi.fn() }));
const mockedLookup = vi.mocked(lookup);

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
