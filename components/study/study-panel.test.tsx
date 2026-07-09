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
