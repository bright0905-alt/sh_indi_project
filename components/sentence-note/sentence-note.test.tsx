import { describe, it, expect, vi, beforeEach } from "vitest";
import { render, screen, within } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { StudyPanel } from "@/components/study/study-panel";
import { WordBook } from "@/components/word-book/word-book";
import { SentenceNote } from "./sentence-note";
import { clearSentences } from "@/hooks/use-sentence-note";
import { clearWords } from "@/hooks/use-word-book";
import { lookup } from "@/services/study-client";

vi.mock("@/services/study-client", () => ({ lookup: vi.fn() }));
const mockedLookup = vi.mocked(lookup);

const SENTENCE = "I go to school every day.";

function App() {
  return (
    <>
      <StudyPanel />
      <div data-testid="wordbook">
        <WordBook />
      </div>
      <div data-testid="note">
        <SentenceNote />
      </div>
    </>
  );
}

async function run(text: string) {
  const user = userEvent.setup();
  await user.clear(screen.getByLabelText("검색어 입력"));
  await user.type(screen.getByLabelText("검색어 입력"), text);
  await user.click(screen.getByRole("button", { name: /검색/ }));
}

describe("SentenceNote — 저장·독립성·중복·영속성 (Scenario 3, 14, 불변)", () => {
  beforeEach(() => {
    clearWords();
    clearSentences();
    window.localStorage.clear();
    mockedLookup.mockReset();
  });

  it("문장 입력 후 문장 노트에 항목이 나타나고, 단어장은 변하지 않는다", async () => {
    mockedLookup.mockResolvedValue({
      kind: "sentence",
      text: SENTENCE,
      translation: "나는 매일 학교에 간다.",
    });
    render(<App />);
    await run(SENTENCE);

    expect(
      await within(screen.getByTestId("note")).findByText(SENTENCE),
    ).toBeInTheDocument();
    // 독립성: 단어장은 비어 있음
    expect(
      within(screen.getByTestId("wordbook")).getByText("저장된 단어가 없습니다"),
    ).toBeInTheDocument();
  });

  it("같은 문장 재입력 후에도 항목은 1개로 유지된다 (중복 방지)", async () => {
    mockedLookup.mockResolvedValue({
      kind: "sentence",
      text: SENTENCE,
      translation: "나는 매일 학교에 간다.",
    });
    render(<App />);
    await run(SENTENCE);
    await within(screen.getByTestId("note")).findByText(SENTENCE);
    await run(SENTENCE);

    expect(
      within(screen.getByTestId("note")).getAllByText(SENTENCE),
    ).toHaveLength(1);
  });

  it("결과 없음 입력 → 단어장·문장 노트 모두 변하지 않는다 (불변 규칙 3)", async () => {
    mockedLookup.mockResolvedValue({ kind: "none" });
    render(<App />);
    await run("asdkjqwe");

    expect(await screen.findByText("검색 결과가 없습니다")).toBeInTheDocument();
    expect(
      within(screen.getByTestId("note")).getByText("저장된 문장이 없습니다"),
    ).toBeInTheDocument();
    expect(
      within(screen.getByTestId("wordbook")).getByText("저장된 단어가 없습니다"),
    ).toBeInTheDocument();
  });

  it("저장 후 localStorage에 유지되고, 재마운트해도 남는다 (불변 규칙 4)", async () => {
    mockedLookup.mockResolvedValue({
      kind: "sentence",
      text: SENTENCE,
      translation: "나는 매일 학교에 간다.",
    });
    const { unmount } = render(<App />);
    await run(SENTENCE);
    await within(screen.getByTestId("note")).findByText(SENTENCE);

    expect(window.localStorage.getItem("esb.sentencenote")).toContain(
      "school",
    );

    unmount();
    render(
      <div data-testid="note2">
        <SentenceNote />
      </div>,
    );
    expect(
      within(screen.getByTestId("note2")).getByText(SENTENCE),
    ).toBeInTheDocument();
  });
});
