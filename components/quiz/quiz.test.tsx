import { describe, it, expect, vi } from "vitest";
import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { Quiz } from "./quiz";
import type { WordEntry } from "@/hooks/use-word-book";

const apple: WordEntry = {
  id: "1",
  term: "apple",
  type: "word",
  meanings: ["사과"],
  examples: [],
  savedAt: 0,
};

describe("Quiz 모드 A — 단어 → 뜻 (Scenario 15)", () => {
  it('"apple"에 "사과" 입력 → 정답이 즉시 표시된다', async () => {
    const user = userEvent.setup();
    render(<Quiz mode="A" entries={[apple]} onExit={vi.fn()} />);

    expect(screen.getByText("apple")).toBeInTheDocument();
    await user.type(screen.getByLabelText("답 입력"), "사과");
    await user.click(screen.getByRole("button", { name: "제출" }));

    expect(screen.getByText("정답")).toBeInTheDocument();
  });

  it('"apple"에 오답 "자동차" 입력 → 오답과 정답이 표시된다', async () => {
    const user = userEvent.setup();
    render(<Quiz mode="A" entries={[apple]} onExit={vi.fn()} />);

    await user.type(screen.getByLabelText("답 입력"), "자동차");
    await user.click(screen.getByRole("button", { name: "제출" }));

    expect(screen.getByText("오답")).toBeInTheDocument();
    expect(screen.getByText(/사과/)).toBeInTheDocument();
  });
});

describe("Quiz 모드 B — 뜻 → 단어 (Scenario 16)", () => {
  it('"사과"에 "apple" 입력 → 정답이 즉시 표시된다', async () => {
    const user = userEvent.setup();
    render(<Quiz mode="B" entries={[apple]} onExit={vi.fn()} />);

    expect(screen.getByText("사과")).toBeInTheDocument();
    await user.type(screen.getByLabelText("답 입력"), "apple");
    await user.click(screen.getByRole("button", { name: "제출" }));

    expect(screen.getByText("정답")).toBeInTheDocument();
  });

  it('"사과"에 오답 "banana" 입력 → 오답과 정답("apple")이 표시된다', async () => {
    const user = userEvent.setup();
    render(<Quiz mode="B" entries={[apple]} onExit={vi.fn()} />);

    await user.type(screen.getByLabelText("답 입력"), "banana");
    await user.click(screen.getByRole("button", { name: "제출" }));

    expect(screen.getByText("오답")).toBeInTheDocument();
    expect(screen.getByText(/apple/)).toBeInTheDocument();
  });
});
