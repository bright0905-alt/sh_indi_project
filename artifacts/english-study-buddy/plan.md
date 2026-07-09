# english-study-buddy 구현 계획

> 입력: `spec.md` (16 시나리오, 불변 규칙 4개), `wireframe.html` (학습 / 단어장 / 문장 노트 / 복습 퀴즈 4개 화면). 확정된 결정: AI 기능은 **Claude API 하나로 통합**(라우트 핸들러), TTS는 **브라우저 Web Speech API**, 영속성은 **localStorage**.

## 아키텍처 결정

| 결정 | 선택 | 이유 |
|---|---|---|
| AI 백엔드 | Claude API를 Next.js 라우트 핸들러(`app/api/*`)에서 호출 | 판별·뜻·해석·문법을 한 모델로 일관 처리. API 키는 서버에만 노출 |
| 판별+조회 통합 | `/api/lookup` 한 번의 호출로 판별(word/idiom/sentence) + 해당 결과(뜻·예문 또는 해석)를 함께 반환. `forceType` 파라미터로 강제 전환 지원 | 왕복 1회로 지연 최소화, 수동 전환(Scn 4)도 같은 엔드포인트 재사용 |
| 구조화 출력 | Claude 강제 tool-use(structured output)로 검증된 JSON 수신 | 자유 텍스트 파싱 실패 방지 |
| 모델 | 기본 `claude-sonnet-5` (config 상수). 비용 우선 시 `claude-haiku-4-5-20251001`로 교체 가능 | 아동용 한국어 뜻·문법 정확도 우선, 교체는 저비용 |
| TTS | 브라우저 `window.speechSynthesis` (`services/speech.ts` 래퍼) | 무료·키 불필요·백엔드 없음 |
| 화면 전환 | 단일 페이지 + 클라이언트 view 상태 (shadcn `Tabs` 4개 영역, 퀴즈는 단어장에서 진입하는 오버레이 view) | 퀴즈에 선택 항목을 넘길 때 라우트 파라미터보다 클라이언트 상태가 단순 |
| 영속성 | localStorage, 커스텀 훅(`use-word-book`, `use-sentence-note`) | 단일 기기·계정 없음(spec 전제). 두 목록 독립 저장 |
| 퀴즈 채점 데이터 | `WordEntry`에 뜻 목록(`meanings: string[]`)을 저장해 두고 오프라인 대조 | 퀴즈마다 API 재호출 없이 동의어 대조 채점(Scn 15) |

## 인프라 리소스

| 리소스 | 유형 | 선언 위치 | 생성 Task |
|---|---|---|---|
| `ANTHROPIC_API_KEY` | Env var | `.env.local` (gitignore됨) | Task 1 |
| `@anthropic-ai/sdk` | 의존성 | `package.json` (`bun add`) | Task 1 |
| shadcn `tabs` | UI 컴포넌트 | `components/ui/tabs.tsx` (`bunx shadcn@latest add tabs`) | Task 6 |

## 데이터 모델

### WordEntry (단어장, localStorage)
- id (required)
- term (required) — 단어 또는 숙어 원문
- type — "word" | "idiom"
- meanings → string[] (채점·읽어주기용)
- examples → string[]
- savedAt (number) — 재검색 시 갱신(Scn 7)

### SentenceEntry (문장 노트, localStorage)
- id (required)
- text (required) — 문장 원문
- translation (required) — 한글 해석
- grammar → GrammarPoint[] | null (상세 클릭 시 채워지며 캐시)
- savedAt (number) — 재입력 시 갱신(Scn 14)

### LookupResult (API 응답, 판별 결과 discriminated union)
- { kind: "word" | "idiom", term, meanings[], examples[] }
- { kind: "sentence", text, translation }
- { kind: "none" } — 결과 없음(Scn 6)

### GrammarPoint (API 응답)
- title (문법 항목명) + explanation (설명)

## 필요 스킬

| 스킬 | 적용 Task | 용도 |
|---|---|---|
| claude-api | 1, 2, 9 | Anthropic SDK 사용법, 모델 ID, 구조화 출력(강제 tool-use), 서버 호출 패턴 |
| next-best-practices | 1, 2, 9 | 라우트 핸들러, RSC 경계, async params, Node 런타임 |
| shadcn | 3, 6, 7, 8, 12 | tabs/radio-group 설치, Card·Dialog·AlertDialog·Checkbox·Input 조합 |
| vercel-react-best-practices | UI 전반 | 상태·렌더 패턴, 불필요 리렌더 방지 |
| web-design-guidelines | 최종 리뷰 | 접근성·UX 점검 |

## 영향 받는 파일

| 파일 경로 | 변경 유형 | 관련 Task |
|---|---|---|
| `types/study.ts` | New | 1, 2, 6, 8, 9 |
| `lib/anthropic.ts` | New | 1 |
| `config/study.ts` (모델 상수 등) | New | 1 |
| `app/api/lookup/route.ts` | New | 1, 2, 4 |
| `app/api/grammar/route.ts` | New | 9 |
| `services/study-client.ts` | New | 1, 2, 9 |
| `services/speech.ts` | New | 3 |
| `hooks/use-word-book.ts` | New | 6, 7 |
| `hooks/use-sentence-note.ts` | New | 8, 10 |
| `components/study/*` | New | 1, 2, 3, 4, 5 |
| `components/word-book/*` | New / Modify | 6, 7, 11, 12 (퀴즈 A/B 진입 버튼) |
| `components/sentence-note/*` | New | 8, 9, 10 |
| `components/quiz/*` | New | 12, 13 |
| `components/ui/tabs.tsx` | New (CLI) | 6 |
| `app/page.tsx` | Modify | 1, 6 |
| `app/layout.tsx` | Modify (title 메타) | 1 |
| `e2e/smoke.spec.ts` | Modify (title "Kanban Todo" → 신규) | 1 |

> **상태: 전체 Task 1–13 구현·커밋 완료.** 27개 vitest 테스트 통과, `bun run build` 성공, eslint 클린(경고 1건은 기존 데모 파일), playwright 스모크 통과. code-reviewer Important 4건 전부 반영. 남은 것: 사용자의 `ANTHROPIC_API_KEY`로 실제 API 동작 검증(Step 5).

## Tasks

### Task 1: 학습 화면 — 단어/숙어 입력 → 뜻+예문 표시 (Claude API 통합)

- **담당 시나리오**: Scenario 1 (표시 부분), Scenario 2 (표시 부분) — 단어장 저장은 Task 6
- **크기**: M (판별+조회를 관통하는 최초 수직 슬라이스 — 위험을 앞에 둔다)
- **의존성**: None
- **참조**:
  - claude-api (Anthropic SDK, 모델 ID, 구조화 출력 강제 tool-use)
  - next-best-practices (route handler, Node 런타임)
- **구현 대상**:
  - `types/study.ts` (LookupResult 등)
  - `config/study.ts` (모델 상수)
  - `lib/anthropic.ts` (서버 Claude 클라이언트 + lookup 함수)
  - `app/api/lookup/route.ts`
  - `services/study-client.ts` (fetch 래퍼)
  - `components/study/study-panel.tsx` (입력 + 단어/숙어 결과 카드)
  - `components/study/study-panel.test.tsx`
  - `app/page.tsx` (수정), `app/layout.tsx` title 수정, `e2e/smoke.spec.ts` title 수정
- **수용 기준**:
  - [ ] "apple" 검색 → 뜻(예: "사과")과 예문 1개 이상이 화면에 표시된다
  - [ ] "kick the bucket" 검색 → 뜻과 예문이 화면에 표시된다
- **검증**:
  - `bun run test -- study-panel` — Anthropic SDK를 `lib/anthropic` 경계(외부 네트워크)에서만 mock. 판별·파싱·렌더 로직은 실제 실행
  - `bun run build`
  - Browser MCP — `/`에서 "apple" 입력·검색, 결과 카드 단언, 증거 `artifacts/english-study-buddy/evidence/task-1.png`

### Task 2: 문장 입력 → 한글 해석 표시 (판별 → 문장 분기)

- **담당 시나리오**: Scenario 3 (해석 표시 부분 — 문장 노트 저장은 Task 8)
- **크기**: S
- **의존성**: Task 1 (lookup 엔드포인트·판별)
- **참조**: claude-api
- **구현 대상**:
  - `app/api/lookup/route.ts` (문장 분기 추가), `types/study.ts` (sentence variant), `services/study-client.ts`
  - `components/study/study-panel.tsx` (문장 해석 카드), 테스트 확장
- **수용 기준**:
  - [ ] "I go to school every day." 입력 → 한글 해석 텍스트가 화면에 표시된다
- **검증**: `bun run test -- study-panel`; Browser MCP로 문장 입력→해석 확인, 증거 `task-2.png`

---

### Checkpoint: Tasks 1-2 이후
- [ ] 모든 테스트 통과: `bun run test`
- [ ] 빌드 성공: `bun run build`
- [ ] 학습 화면에서 단어·숙어·문장 입력이 각각 올바른 결과(뜻+예문 / 해석)로 end-to-end 동작

---

### Task 3: 발음 듣기 (Web Speech API)

- **담당 시나리오**: Scenario 5
- **크기**: S
- **의존성**: Task 1, 2 (결과 카드)
- **참조**: —
- **구현 대상**:
  - `services/speech.ts` (`speak(text, lang)` 래퍼) + `services/speech.test.ts`
  - `components/study/study-panel.tsx` ("발음 듣기" 버튼 연결)
- **수용 기준** (spec Scn 5 "음성이 재생된다"의 테스트 경계 조정: 자동 테스트는 합성 호출을, 실제 재생은 브라우저 검증으로 증명):
  - [ ] 단어 검색 결과에서 발음 듣기 클릭 → 해당 단어 텍스트로 영어 음성 합성이 호출된다
  - [ ] 문장 해석 결과에서 발음 듣기 클릭 → 해당 문장 텍스트로 음성 합성이 호출된다
- **검증**: `bun run test -- speech` — jsdom에 `window.speechSynthesis`/`SpeechSynthesisUtterance` 스텁 주입, `speak` 호출 인자(텍스트·lang="en-US") 단언. 실제 소리 재생은 Browser MCP/human review로 확인, 증거 `task-3`

### Task 4: 자동 판별 수동 전환 ("다른 방식으로 보기")

- **담당 시나리오**: Scenario 4
- **크기**: S
- **의존성**: Task 1, 2 (양쪽 결과 렌더)
- **구현 대상**: `app/api/lookup/route.ts`(`forceType` 파라미터), `services/study-client.ts`, `components/study/study-panel.tsx`(전환 버튼) + 테스트
- **수용 기준**:
  - [ ] 단어로 판별된 결과에서 전환 클릭 → 같은 문구의 문장 해석 결과가 표시된다
  - [ ] 문장으로 판별된 결과에서 전환 클릭 → 같은 문구의 단어/숙어 사전 결과가 표시된다
- **검증**: `bun run test -- study-panel`; Browser MCP, 증거 `task-4`

### Task 5: 검색/해석 결과 없음 안내

- **담당 시나리오**: Scenario 6
- **크기**: S
- **의존성**: Task 1
- **구현 대상**: `app/api/lookup/route.ts`(`kind: "none"`), `components/study/study-panel.tsx`(안내 문구) + 테스트
- **수용 기준**:
  - [ ] 사전에 없는 입력("asdkjqwe") → "검색 결과가 없습니다" 문구가 표시된다
- **검증**: `bun run test -- study-panel`

---

### Checkpoint: Tasks 3-5 이후
- [ ] 모든 테스트 통과 + 빌드 성공
- [ ] 학습 화면이 완성 상태: 검색·양방향 결과·발음·수동 전환·결과 없음 안내가 모두 동작

---

### Task 6: 단어장 자동 저장 + 목록 + 중복 처리 (localStorage) + 탭 셸 도입

- **담당 시나리오**: Scenario 1·2 (저장 부분), Scenario 7 (재검색 중복)
- **크기**: M
- **의존성**: Task 1 (lookup 결과)
- **참조**: shadcn (tabs 설치, Card 조합)
- **구현 대상**:
  - `bunx shadcn@latest add tabs` → `components/ui/tabs.tsx`
  - `hooks/use-word-book.ts` (add/dedup/persist) + `hooks/use-word-book.test.tsx`
  - `components/word-book/word-book.tsx` (목록 + "전체 선택" 체크박스·선택 개수 표시) + 테스트
  - `components/study/study-panel.tsx` (결과 카드에 "단어장에 저장됨" 배지)
  - `app/page.tsx` (Tabs 셸: 학습/단어장/문장 노트/복습 퀴즈), 학습 결과 저장 연결
- **수용 기준**:
  - [ ] "apple" 검색 후 단어장에 "apple" 항목이 나타난다
  - [ ] "kick the bucket" 검색 후 단어장에 해당 항목이 나타난다
  - [ ] "apple" 재검색 후에도 단어장의 "apple" 항목은 1개로 유지되고 검색 시각이 갱신된다
- **검증**: `bun run test -- word-book`; 새로고침 후 유지(remount 테스트); Browser MCP, 증거 `task-6`

### Task 7: 단어장 개별 삭제 + 전체 초기화

- **담당 시나리오**: Scenario 8, Scenario 9
- **크기**: M
- **의존성**: Task 6
- **참조**: shadcn (AlertDialog)
- **구현 대상**: `hooks/use-word-book.ts`(remove/clear), `components/word-book/word-book.tsx`(삭제 버튼 + 전체 초기화 AlertDialog) + 테스트
- **수용 기준**:
  - [ ] 삭제 클릭 → 단어장에서 해당 항목이 사라지고 항목 수가 1 감소한다
  - [ ] 전체 초기화 확인 → 단어장 항목 수가 0이 되고 빈 상태 안내가 표시된다
  - [ ] 확인 대화상자에서 취소 → 단어장이 그대로 유지된다
- **검증**: `bun run test -- word-book`

---

### Checkpoint: Tasks 6-7 이후
- [ ] 모든 테스트 통과 + 빌드 성공
- [ ] 단어장: 자동 저장·중복 방지·개별 삭제·전체 초기화·새로고침 유지가 end-to-end 동작

---

### Task 8: 문장 노트 자동 저장 + 목록 + 중복 처리 (localStorage)

- **담당 시나리오**: Scenario 3 (저장 부분), Scenario 14 (재입력 중복)
- **크기**: M
- **의존성**: Task 2 (문장 분기), Task 6 (탭 셸)
- **구현 대상**: `hooks/use-sentence-note.ts` + 테스트, `components/sentence-note/sentence-note.tsx`(목록), 학습 결과(문장) 저장 연결
- **수용 기준**:
  - [ ] 문장 입력 후 문장 노트에 해당 문장 항목이 나타난다
  - [ ] 문장 입력 전후로 단어장 항목 수가 동일하다 (독립성 — 불변 규칙 1)
  - [ ] 같은 문장 재입력 후에도 문장 노트 항목은 1개로 유지되고 저장 시각이 갱신된다
  - [ ] 결과 없음 입력("asdkjqwe") 후 단어장·문장 노트 항목 수가 각각 그대로 유지된다 (불변 규칙 3 — Task 5의 안내 문구와 짝을 이루는 저장 불변 검증. 두 훅이 모두 존재하는 이 시점에 검증)
- **검증**: `bun run test -- sentence-note` — 저장·중복·독립성·결과없음 불변에 더해 `use-sentence-note` remount/영속성(새로고침 후 유지, 불변 규칙 4) 테스트 포함 (Task 6와 대칭); Browser MCP, 증거 `task-8`

### Task 9: 저장된 문장 클릭 → 문법 설명 상세 (Claude API + 해석 + 발음)

- **담당 시나리오**: Scenario 11
- **크기**: M
- **의존성**: Task 8 (문장 목록), Task 3 (TTS 재사용)
- **참조**: claude-api (구조화 출력), next-best-practices
- **구현 대상**: `app/api/grammar/route.ts`, `services/study-client.ts`(grammar 호출), `types/study.ts`(GrammarPoint), `components/sentence-note/sentence-detail.tsx`(원문+문법 설명+해석+발음 버튼), grammar 결과 캐시 + 테스트
- **수용 기준**:
  - [ ] 저장된 문장 클릭 → 해당 문장의 한글 해석이 표시된다
  - [ ] 저장된 문장 클릭 → 적용된 문법 설명 텍스트가 표시된다
  - [ ] 상세의 "발음 듣기" 클릭 → 해당 문장으로 음성 합성이 호출된다
- **검증**: `bun run test -- sentence-detail` (Anthropic mock는 grammar 경계에서); Browser MCP, 증거 `task-9`

### Task 10: 문장 노트 개별 삭제 + 전체 초기화

- **담당 시나리오**: Scenario 12, Scenario 13
- **크기**: S
- **의존성**: Task 8
- **참조**: shadcn (AlertDialog)
- **구현 대상**: `hooks/use-sentence-note.ts`(remove/clear), `components/sentence-note/sentence-note.tsx`(삭제 + 전체 초기화) + 테스트
- **수용 기준**:
  - [ ] 삭제 클릭 → 문장 노트에서 해당 문장이 사라지고 항목 수가 1 감소한다
  - [ ] 전체 초기화 확인 → 문장 노트 항목 수가 0이 되고 빈 상태 안내가 표시된다
  - [ ] 취소 시 문장 노트가 그대로 유지된다
- **검증**: `bun run test -- sentence-note`

---

### Checkpoint: Tasks 8-10 이후
- [ ] 모든 테스트 통과 + 빌드 성공
- [ ] 문장 노트: 저장·중복 방지·문법 설명 상세·삭제·초기화가 동작하며 단어장과 독립적임을 확인

---

### Task 11: 단어 선택 읽어주기 (발음 + 뜻 순차 재생)

- **담당 시나리오**: Scenario 10
- **크기**: S
- **의존성**: Task 6 (단어 목록), Task 3 (speech 서비스)
- **구현 대상**: `components/word-book/word-book.tsx`(체크박스 선택 + "읽어주기" 버튼), 선택 항목만 순차 재생(영어 발음 → 한글 뜻) + 테스트
- **수용 기준**:
  - [ ] "apple"만 선택 후 읽어주기 → "apple" 발음과 뜻으로 음성 합성이 순서대로 호출된다
  - [ ] 선택하지 않은 항목("kick the bucket")은 재생 대상에서 제외된다
  - [ ] 읽어주기 대상은 단어장 항목에 한정된다 — 문장 노트 항목은 대상에 포함되지 않는다 (불변 규칙 2)
- **검증**: `bun run test -- word-book` (speech 스텁으로 호출 순서·대상 단언); Browser MCP/human review로 실제 소리, 증거 `task-11`

### Task 12: 복습 퀴즈 모드 A (단어 제시 → 뜻 입력, 동의어 대조 자동 채점)

- **담당 시나리오**: Scenario 15
- **크기**: M
- **의존성**: Task 6 (단어 목록·선택)
- **참조**: vercel-react-best-practices
- **구현 대상**:
  - `components/quiz/quiz.tsx`(선택 항목으로 진입, 모드 A, 문제별 즉시 피드백), 저장된 `meanings[]`와 대조 채점 + 테스트
  - `components/word-book/word-book.tsx` 수정 — "퀴즈 A"/"퀴즈 B" 진입 버튼 추가 및 quiz view로 전환 (wireframe Screen 1 액션바)
- **수용 기준**:
  - [ ] 단어장에서 항목 선택 후 "퀴즈 A" 클릭 → 선택 항목으로 퀴즈가 시작된다
  - [ ] "apple" 문제에 "사과" 입력·제출 → "정답"과 올바른 뜻이 즉시 표시된다
  - [ ] "apple" 문제에 오답("자동차") 입력·제출 → "오답"과 올바른 뜻이 즉시 표시된다
  - [ ] 퀴즈 대상은 단어장 선택 항목에 한정된다 — 문장 노트 항목은 출제되지 않는다 (불변 규칙 2)
- **검증**: `bun run test -- quiz`; Browser MCP, 증거 `task-12`

### Task 13: 복습 퀴즈 모드 B (뜻 제시 → 단어 입력)

- **담당 시나리오**: Scenario 16
- **크기**: S
- **의존성**: Task 12
- **구현 대상**: `components/quiz/quiz.tsx`(모드 B 분기: 뜻 제시, 단어 대소문자 무시 대조) + 테스트
- **수용 기준**:
  - [ ] "사과" 문제에 "apple" 입력·제출 → "정답"이 즉시 표시된다
  - [ ] "사과" 문제에 오답("banana") 입력·제출 → "오답"과 정답("apple")이 즉시 표시된다
- **검증**: `bun run test -- quiz`

---

### Checkpoint: Tasks 11-13 이후 (최종)
- [ ] 전체 테스트 통과: `bun run test`
- [ ] 빌드 성공: `bun run build`
- [ ] e2e 스모크 통과: `bun run test:e2e`
- [ ] 불변 규칙 확인: (a) 문장은 단어장에 없고 문장 노트에만 있음 (b) 퀴즈·읽어주기는 단어장만 대상 (c) 결과 없음 입력은 두 목록 불변 (d) 새로고침 후 두 목록 유지
- [ ] web-design-guidelines로 학습/단어장/문장 노트/퀴즈 접근성·UX 최종 리뷰

## 미결정 항목

없음 — 아키텍처 결정과 스코프가 확정됨. 모델 선택(sonnet/haiku)은 `config/study.ts` 상수로 저비용 교체 가능하므로 구현 중 판단.
