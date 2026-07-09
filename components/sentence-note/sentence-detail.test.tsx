import { describe, it, expect, vi, beforeEach } from "vitest";
import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { SentenceNote } from "./sentence-note";
import { clearSentences, addSentence } from "@/hooks/use-sentence-note";
import { fetchGrammar } from "@/services/study-client";

vi.mock("@/services/study-client", () => ({
  lookup: vi.fn(),
  fetchGrammar: vi.fn(),
}));
const mockedGrammar = vi.mocked(fetchGrammar);

const SENTENCE = "I go to school every day.";
const speakSpy = vi.fn();

class FakeUtterance {
  text: string;
  lang = "";
  constructor(text: string) {
    this.text = text;
  }
}

describe("SentenceDetail — 문법 설명 상세 (Scenario 11)", () => {
  beforeEach(() => {
    clearSentences();
    window.localStorage.clear();
    mockedGrammar.mockReset();
    speakSpy.mockReset();
    vi.stubGlobal("SpeechSynthesisUtterance", FakeUtterance);
    vi.stubGlobal("speechSynthesis", { speak: speakSpy, cancel: vi.fn() });
  });

  it("저장된 문장 클릭 → 해석 + 문법 설명 + 발음이 표시된다", async () => {
    mockedGrammar.mockResolvedValue([
      { title: "현재 시제", explanation: "습관을 나타낼 때 동사원형을 쓴다." },
    ]);
    addSentence({ text: SENTENCE, translation: "나는 매일 학교에 간다." });

    const user = userEvent.setup();
    render(<SentenceNote />);

    await user.click(screen.getByText(SENTENCE));

    // 해석
    expect(screen.getByText(/나는 매일 학교에 간다\./)).toBeInTheDocument();
    // 문법 설명 (fetch 후 저장 → 재렌더)
    expect(await screen.findByText(/현재 시제/)).toBeInTheDocument();
    expect(
      screen.getByText(/습관을 나타낼 때 동사원형을 쓴다\./),
    ).toBeInTheDocument();

    // 발음 듣기
    await user.click(screen.getByRole("button", { name: /발음 듣기/ }));
    expect(speakSpy).toHaveBeenCalledTimes(1);
    expect((speakSpy.mock.calls[0][0] as FakeUtterance).text).toBe(SENTENCE);
  });
});
