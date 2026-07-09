# english-study-buddy — learnings

---
category: refactor
applied: not-yet
---
## Task 4·5 병합 (수동 전환 + 결과 없음)

**상황**: Step 3. Task 4(다른 방식으로 보기)와 Task 5(결과 없음 안내)가 둘 다 study-panel.tsx ResultCard 한 파일의 작은 편집.
**판단**: 한 번의 컴포넌트 재작성으로 둘을 함께 구현하고 단일 커밋으로 처리. 별도 커밋 시 같은 파일을 두 번 건드려 diff가 얽힘. 두 시나리오(4·6) 테스트는 각각 추가.
**다시 마주칠 가능성**: 중간 — 같은 UI 컴포넌트에 얹히는 인접 시나리오는 병합이 합리적.

---
category: task-ordering
applied: not-yet
---
## Task 실행 순서

**상황**: Step 2, plan.md의 13개 Task 의존성 분석.
**판단**: plan.md 순서(1→13)를 그대로 따름. 위험(Claude API 통합)이 Task 1에 front-load돼 있고 의존성도 선형(2→1, 6→1, 8→2·6, 9→8·3, 11→6·3, 12→6, 13→12)이라 재정렬 불필요. lib/anthropic는 Task 1에서 문장 분기까지 포함해 구현(한 프롬프트로 판별+내용 반환) → Task 2는 렌더링만 추가, throwaway 없음.
**다시 마주칠 가능성**: 낮음 — 이번 plan 특유.

---
category: tooling
applied: not-yet
---
## 구조화 출력: output_config 대신 강제 tool-use 채택

**상황**: Step 3, Task 1 Claude API 통합. structured output을 output_config.format vs 강제 tool_choice 중 선택.
**판단**: plan이 명시한 강제 tool-use 채택. SDK 0.110.0에서 tool_choice + Anthropic.Tool 타입이 안정적으로 타입됨. `thinking: {type:"disabled"}`로 단순 조회 지연 최소화(Sonnet 5는 thinking 미지정 시 adaptive 기본값이라 명시적 비활성화 필요). 모델은 승인된 plan대로 claude-sonnet-5.
**다시 마주칠 가능성**: 중간 — 이후 grammar route(Task 9)에서 동일 패턴 재사용.

---
category: escalation
applied: not-yet
---
## ANTHROPIC_API_KEY 필요 — 실제 API 검증은 사용자 키 대기

**상황**: Task 1 검증. lib/anthropic가 `new Anthropic()`로 ANTHROPIC_API_KEY를 읽는다.
**판단**: 테스트는 서비스 경계 mock으로 통과, build 통과. 실제 API 호출(Browser MCP)은 사용자의 `.env.local` ANTHROPIC_API_KEY가 있어야 가능 → Step 5 human review에서 사용자가 키를 넣고 확인하도록 위임.
**다시 마주칠 가능성**: 높음 — API 키 의존 feature의 공통 패턴.
