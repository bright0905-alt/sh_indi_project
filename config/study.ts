// 설정 상수 — types에만 의존 (config 레이어)

/**
 * 조회·해석·문법 설명에 사용하는 Claude 모델.
 * 아동용 한국어 뜻·해석 정확도를 위해 sonnet-5를 기본값으로 한다.
 * 비용 우선 시 "claude-haiku-4-5-20251001"로 교체 가능.
 */
export const STUDY_MODEL = "claude-sonnet-5";

/** 발음 재생 언어 (Web Speech API) */
export const SPEECH_LANG = "en-US";
