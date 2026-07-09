import "server-only";
import Anthropic from "@anthropic-ai/sdk";
import { STUDY_MODEL } from "@/config/study";
import type { ForceType, LookupResult } from "@/types/study";

// 서버 전용 Claude 클라이언트. ANTHROPIC_API_KEY 환경변수를 읽는다.
let client: Anthropic | null = null;
function getClient(): Anthropic {
  if (!client) client = new Anthropic();
  return client;
}

// 강제 tool-use로 검증된 JSON을 받기 위한 도구 정의.
const LOOKUP_TOOL: Anthropic.Tool = {
  name: "emit_lookup",
  description: "입력을 판별하고 사전 결과 또는 문장 해석을 구조화해 반환한다.",
  input_schema: {
    type: "object",
    additionalProperties: false,
    properties: {
      kind: {
        type: "string",
        enum: ["word", "idiom", "sentence", "none"],
        description:
          "입력이 단어면 word, 숙어면 idiom, 문장이면 sentence, 사전에 없거나 해석 불가면 none",
      },
      term: {
        type: "string",
        description: "word/idiom일 때 표제어, sentence일 때 원문, none이면 빈 문자열",
      },
      meanings: {
        type: "array",
        items: { type: "string" },
        description:
          "word/idiom일 때 한국어 뜻 목록(여러 표현 허용). 그 외에는 빈 배열",
      },
      examples: {
        type: "array",
        items: { type: "string" },
        description: "word/idiom일 때 영어 예문 목록(1개 이상). 그 외에는 빈 배열",
      },
      translation: {
        type: "string",
        description: "sentence일 때 한국어 해석. 그 외에는 빈 문자열",
      },
    },
    required: ["kind", "term", "meanings", "examples", "translation"],
  },
};

interface RawLookup {
  kind: "word" | "idiom" | "sentence" | "none";
  term: string;
  meanings: string[];
  examples: string[];
  translation: string;
}

function systemPrompt(forceType?: ForceType): string {
  const base =
    "너는 초등 고학년~중학생을 위한 영어 학습 도우미다. 입력된 영어 표현이 " +
    "단어(word)인지 숙어(idiom)인지 문장(sentence)인지 의미를 파악해 판별하고, " +
    "판별 결과에 맞는 내용을 emit_lookup 도구로 반환한다. " +
    "단어/숙어면 아동 수준의 쉬운 한국어 뜻(여러 표현 가능)과 영어 예문 1개 이상을 준다. " +
    "문장이면 자연스러운 한국어 해석을 준다. " +
    "사전에 없는 단어이거나 해석할 수 없으면 kind를 none으로 한다.";
  if (forceType === "dictionary") {
    return (
      base +
      " 이번에는 반드시 단어/숙어(word 또는 idiom)로 처리한다. 문장으로 판별하지 않는다."
    );
  }
  if (forceType === "sentence") {
    return base + " 이번에는 반드시 문장(sentence)으로 처리해 한국어 해석을 준다.";
  }
  return base;
}

/** 입력 텍스트를 판별하고 사전 결과/문장 해석/결과 없음을 반환한다. */
export async function lookupText(
  input: string,
  forceType?: ForceType,
): Promise<LookupResult> {
  const message = await getClient().messages.create({
    model: STUDY_MODEL,
    max_tokens: 1024,
    thinking: { type: "disabled" },
    system: systemPrompt(forceType),
    tools: [LOOKUP_TOOL],
    tool_choice: { type: "tool", name: "emit_lookup" },
    messages: [{ role: "user", content: input }],
  });

  const block = message.content.find((b) => b.type === "tool_use");
  if (!block || block.type !== "tool_use") {
    return { kind: "none" };
  }
  const raw = block.input as RawLookup;

  if (raw.kind === "word" || raw.kind === "idiom") {
    return {
      kind: raw.kind,
      term: raw.term,
      meanings: raw.meanings ?? [],
      examples: raw.examples ?? [],
    };
  }
  if (raw.kind === "sentence") {
    return { kind: "sentence", text: raw.term, translation: raw.translation };
  }
  return { kind: "none" };
}
