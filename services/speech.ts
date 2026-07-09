import { SPEECH_LANG } from "@/config/study";

/** 브라우저 Web Speech API로 텍스트를 음성 합성한다. */
export function speak(text: string, lang: string = SPEECH_LANG): void {
  if (typeof window === "undefined" || !window.speechSynthesis) return;
  const utterance = new SpeechSynthesisUtterance(text);
  utterance.lang = lang;
  window.speechSynthesis.cancel();
  window.speechSynthesis.speak(utterance);
}

/**
 * 여러 발화를 순서대로 재생한다. 각 발화가 끝나면 다음으로 넘어간다.
 * (읽어주기 기능에서 단어 발음 → 뜻을 순차 재생할 때 사용)
 */
export function speakSequence(
  utterances: { text: string; lang?: string }[],
): void {
  if (typeof window === "undefined" || !window.speechSynthesis) return;
  window.speechSynthesis.cancel();
  for (const item of utterances) {
    const u = new SpeechSynthesisUtterance(item.text);
    u.lang = item.lang ?? SPEECH_LANG;
    window.speechSynthesis.speak(u);
  }
}
