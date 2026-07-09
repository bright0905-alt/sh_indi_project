import { describe, it, expect, vi, beforeEach } from "vitest";
import { speak, speakSequence } from "./speech";

// jsdom은 speechSynthesis를 구현하지 않으므로 스텁을 주입한다.
class FakeUtterance {
  text: string;
  lang = "";
  constructor(text: string) {
    this.text = text;
  }
}

const speakSpy = vi.fn();
const cancelSpy = vi.fn();

beforeEach(() => {
  speakSpy.mockReset();
  cancelSpy.mockReset();
  vi.stubGlobal("SpeechSynthesisUtterance", FakeUtterance);
  vi.stubGlobal("speechSynthesis", { speak: speakSpy, cancel: cancelSpy });
});

describe("speech (Scenario 5)", () => {
  it("speak → 주어진 텍스트와 en-US로 음성 합성이 호출된다", () => {
    speak("apple");
    expect(speakSpy).toHaveBeenCalledTimes(1);
    const utterance = speakSpy.mock.calls[0][0] as FakeUtterance;
    expect(utterance.text).toBe("apple");
    expect(utterance.lang).toBe("en-US");
  });

  it("speak → 문장 텍스트로 음성 합성이 호출된다", () => {
    speak("I go to school every day.");
    const utterance = speakSpy.mock.calls[0][0] as FakeUtterance;
    expect(utterance.text).toBe("I go to school every day.");
  });

  it("speakSequence → 발화들이 순서대로 큐잉된다", () => {
    speakSequence([
      { text: "apple" },
      { text: "사과", lang: "ko-KR" },
    ]);
    expect(speakSpy).toHaveBeenCalledTimes(2);
    expect((speakSpy.mock.calls[0][0] as FakeUtterance).text).toBe("apple");
    expect((speakSpy.mock.calls[1][0] as FakeUtterance).lang).toBe("ko-KR");
  });
});
