# english-study-buddy — 세션 인계 메모

## 현재 상태
- 브랜치: `feat/english-study-buddy` (main 대비 17커밋, 워킹트리 clean)
- 전체 워크플로 완료: idea → spec → wireframe → plan → **execute 완료**
- 27개 vitest 통과, `bun run build` 성공, eslint 클린, playwright 스모크 통과
- code-review(Important 4건) 반영 완료, Compound 1건 승격(ESLint 레이어 규칙)

## 완료된 것 (Task 1–13, spec 16 시나리오 전부 구현+테스트)
- 학습 화면: 단어/숙어 검색·문장 해석·발음(TTS)·수동 전환·결과 없음
- 단어장: 자동 저장·중복 방지·삭제·전체 초기화·선택 읽어주기·퀴즈 진입
- 문장 노트: 저장·중복·문법 설명 상세(AI)·삭제·초기화 (단어장과 독립)
- 복습 퀴즈: 모드 A(단어→뜻)·B(뜻→단어) 즉시 채점
- 아키텍처: Claude API 라우트(`/api/lookup`, `/api/grammar`, 강제 tool-use, 모델 claude-sonnet-5) / Web Speech TTS / localStorage 제네릭 스토어(`hooks/create-local-store.ts`) / shadcn Tabs

## 남은 일 (다음 세션)
1. **실제 API 검증 (핵심)**: `.env.local`에 `ANTHROPIC_API_KEY=sk-ant-...` 추가 → `bun run dev` 재시작 → `apple`/문장 검색으로 뜻·해석·문법 품질 확인. (키 없으면 /api/lookup이 502 + "조회 중 문제가 발생했습니다" 노출 — 오류 처리는 검증됨)
2. 검증 OK면 `main`으로 PR 생성 후 머지.
3. (선택) 문장 노트/단어장에 미묘한 다크테마 표시 등 시각 다듬기, web-design-guidelines 접근성 리뷰.

## 참고
- 상세 판단·회고: `artifacts/english-study-buddy/learnings.md`
- 계획·시나리오: `artifacts/english-study-buddy/{plan,spec,wireframe.html}.md`
- 레이어 규칙은 이제 ESLint로 강제됨(`eslint.config.mjs`): components/ 는 @/services/* 직접 import 금지 → hooks 경유.
