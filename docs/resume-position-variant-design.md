# 이력서 포지션별 노출 순서(Variant) 설계

## 배경 / 목적

현재 `site-root` 이력서는 백엔드 지원용 콘텐츠(DevTicket, BookCommerce 등)와 AI
자동화/에이전트 지원용 콘텐츠(Hermes Knowledge Engine, KRX Brief)가 한 페이지에
고정 순서로 섞여 있다. 지원 포지션에 따라 상단에 노출되는 프로젝트·역량이 달라져야
스크리너가 짧은 스캔에서 관련성을 바로 파악한다.

요구사항 (사용자 확정):
1. 화면판/인쇄판이 지금처럼 마크업 2벌로 따로 관리되지 않고, 구조(순서 데이터·콘텐츠
   소스)를 하나로 통일한다.
2. 라이프 타임라인 앱처럼, 포지션(`master` / `backend` / `ai`)에 따라 노출 순서가
   달라진다. 텍스트 내용까지 달라질 수도 있으나 현재는 미확정 — 순서만 우선 구현.
3. 인쇄판도 화면판과 동일하게 포지션별 순서를 반영한다.

## 현재 구조 (As-Is)

- **`site-root/index.html`**: 정적 HTML. `#projects` 섹션(화면용)과
  `#print-resume`(인쇄용) 두 블록에 프로젝트 카드(`p1`/`p3`/`p4`)와 skills bullet이
  **각각 하드코딩**되어 있다. 순서를 바꾸려면 두 블록을 손으로 각각 옮겨야 하고,
  하나만 바꾸면 화면/인쇄가 어긋난다.
- **`site-root/i18n.js`**: 실제 텍스트 콘텐츠. `projects.p1.title`, `skills.li1` 같은
  키로 한/영 텍스트를 보관. `data-i18n` 속성과 매칭되어 `app.js`가 `innerHTML`을
  주입하는 구조 — 즉 콘텐츠(텍스트)와 배치(순서)가 이미 분리되어 있고, 배치만
  마크업에 물리적으로 박혀 있다.
- **`site-root/app.js`**: `NAV_ORDER` 배열로 side-nav 8개 섹션 순서만 관리. 이
  배열 기반 렌더링 패턴(데이터 → `forEach` → DOM 생성)이 이미 존재하며, 이번 설계는
  같은 패턴을 프로젝트/skills 항목 단위로 확장하는 것.
- **인쇄 CSS (`style.css`)**: `.pr-entry`가 `page-break-inside: auto` /
  `.pr-entry-head`가 `break-inside: avoid` 등 **순수 block 흐름 기반 페이지네이션**에
  의존 (style.css:237, 253, 256). flex/grid `order` 속성으로 시각 순서만 바꾸는
  방식은 이 인쇄 페이지네이션과 충돌 위험이 있어 기각 — 상세는 "검토한 접근법" 참조.
- 언어 전환(`applyLang`)은 `localStorage` 기반 토글 버튼. variant 전환과는 요구사항이
  다름(공유 링크로 특정 버전을 바로 열어야 함) — 그대로 재사용 불가, 별도 메커니즘 필요.

## 검토한 접근법

### A. Variant 선택 방식

| 방식 | 장점 | 단점 |
|---|---|---|
| **URL 쿼리 파라미터 (`?v=backend`)** ✅ 채택 | 콘텐츠 소스 하나, 링크 공유 시 상대 화면에 원하는 버전 바로 노출, 인쇄도 같은 DOM이라 자동 대응, 정적 호스팅(GitHub Pages) 구조 그대로 유지 | URL이 약간 안 예쁨 (감수 가능) |
| 페이지 내 토글 버튼 | 방문자가 직접 비교 가능 | 공유 링크로 특정 버전을 못 박음 — 지원 목적(백엔드 담당자에게 backend 버전)에 안 맞음. 기각 |
| 별도 경로 (`/resume/backend/`) | URL 제일 깔끔 | GitHub Pages는 서버 라우팅이 없어 폴더마다 실제 `index.html` 파일이 물리적으로 필요 → entry point가 3벌로 갈라짐, 요구사항1(구조 통일)과 충돌. 기각 |

### B. 순서 반영 방식

| 방식 | 장점 | 단점 |
|---|---|---|
| **JS가 order 배열로 DOM을 직접 생성** ✅ 채택 | DOM 삽입 순서 = 문서 순서라서 인쇄 페이지네이션 CSS(block 흐름 의존)에 영향 없음. 화면/인쇄 공통 템플릿 함수 하나로 중복 마크업 제거 → 요구사항1 충족 | 렌더링 코드 추가 필요 (단, `NAV_ORDER` 패턴 재사용이라 신규 개념 아님) |
| CSS `order` 속성 (flex/grid 부여 후 순서만 시각적으로 변경) | 코드 최소, 마크업 안 건드림 | 인쇄 쪽 `.pr-entry`를 flex/grid로 바꿔야 `order`가 먹는데, 이미 튜닝된 `page-break-inside` 규칙과 충돌 위험(브라우저별 flex+print 페이지 분할 버그 이력 있음). 텍스트 자체가 달라지는 미래 요구사항(요구사항2 후반부)엔 애초에 대응 불가. 기각 |
| 화면/인쇄/variant 전체 조합을 정적 HTML로 각각 하드코딩 | 로직 없음 | 3 variant × 2(화면/인쇄) = 6블록 손 유지보수, 하나 놓치면 즉시 불일치. 요구사항1과 정면 충돌. 기각 |

## 선택한 설계 (To-Be)

### Variant 정의

```js
// site-root/app.js 상단, NAV_ORDER 근처에 추가
var VARIANTS = ['master', 'backend', 'ai'];
var DEFAULT_VARIANT = 'master';

var PROJECT_ORDER = {
  master:  ['p1', 'p3', 'p4'],   // 현재 순서 그대로 = 기본값
  backend: ['p3', 'p4', 'p1'],
  ai:      ['p1', 'p3', 'p4'],   // 정확한 값은 구현 단계에서 사용자가 확정
};

var SKILLS_ORDER = {
  master:  ['li1', 'li2', 'li3', 'li4'],
  backend: ['li1', 'li2', 'li4', 'li3'],
  ai:      ['li3', 'li1', 'li2', 'li4'],
};
```

- 값은 예시. 실제 순서는 구현 단계에서 확정(플랜 문서 or 구현 중 확인).
- 배열에 없는 variant 값이 들어오면(`?v=xyz`) `DEFAULT_VARIANT`로 폴백.

### Variant 판별

```js
function getVariant() {
  var v = new URLSearchParams(window.location.search).get('v');
  return VARIANTS.indexOf(v) !== -1 ? v : DEFAULT_VARIANT;
}
```

- `localStorage` 저장 안 함 (언어 토글과 다르게, variant는 링크에 의해 결정되는 게
  의도된 동작 — 공유받은 사람이 파라미터 없이 루트로 들어오면 항상 `master`가 보여야
  함).

### 프로젝트 콘텐츠 스키마 (Codex 리뷰 반영)

`/codex:adversarial-review` 지적: order 배열(`PROJECT_ORDER`)만으로는 렌더러가 각
프로젝트의 실제 bullet 개수를 알 수 없음. 실사용 데이터 확인 결과 프로젝트별로
markup에 노출되는 bullet 수가 다르다 (`p1`→li1,li2 2개, `p3`→li1,li2 2개,
`p4`→li1,li2,li3 3개). 참고로 `i18n.js`에는 `p1.li3`, `p3.li3`, `p1.r1/r2` 키가
더 존재하지만 현재 index.html 어디에도 참조되지 않는 죽은 키다 — 이 죽은 키를
"존재하니까 렌더링 대상"으로 잘못 추론하면 안 되므로, **파생이 아니라 명시적
스키마**로 렌더링 대상을 고정한다:

```js
var PROJECT_META = {
  p1: { bullets: ['li1', 'li2'] },
  p3: { bullets: ['li1', 'li2'] },
  p4: { bullets: ['li1', 'li2', 'li3'] },
};
```

- `renderProjectEntry(id, mode)`는 `PROJECT_ORDER[variant]`가 준 id 순서로 돌면서,
  각 id의 bullet 목록은 `PROJECT_META[id].bullets`에서만 가져온다 (i18n.js에 그
  키가 있는지 여부로 유추하지 않음).
- title/date/meta/quote/tech/link는 모든 프로젝트에 공통으로 존재하는 필드라 스키마
  불필요 — `renderProjectEntry`가 고정으로 생성.
- 새 프로젝트 추가 시 `PROJECT_META`에 항목 하나, `i18n.js`에 해당 키들, 필요한
  variant의 `PROJECT_ORDER`에 id 추가 — 3곳만 손대면 됨.

### 렌더링

- `index.html`에서 `#projects .section-body`, `#print-resume .pr-section-flow`
  (projects 부분), skills의 `ul.label-list` / `ul.pr-label-list` 내부 하드코딩된
  엔트리/li를 제거하고 빈 컨테이너만 남긴다.
- `app.js`에 템플릿 함수 2종 추가:
  - `renderProjectEntry(id, mode)` — `mode`가 `'screen'`이면 `.entry` 계열 클래스,
    `'print'`이면 `.pr-entry` 계열 클래스로 DOM 생성. bullet은 `PROJECT_META[id].bullets`
    순서대로 생성. 텍스트는 지금처럼 `data-i18n="projects.${id}.title"` 등 속성만
    심어두고, 기존 `applyLang()`이 그대로 채워 넣는다 (i18n 로직 재사용, 변경 없음).
  - `renderSkillLi(id, mode)` — 위와 동일한 패턴으로 skills bullet 생성 (skills는
    항목당 하위 리스트가 없어 스키마 불필요, `SKILLS_ORDER`만으로 충분).
- 페이지 로드 시: `var variant = getVariant();` → `PROJECT_ORDER[variant]` 순서로
  화면·인쇄 컨테이너 양쪽에 엔트리 생성 → `applyLang(currentLang)` 호출해 텍스트 채움
  (현재도 `applyLang`이 `data-i18n` 전체를 스캔하는 구조라 순서 무관하게 동작).

### 확장 포인트 (지금 구현 안 함, 문서만)

요구사항2 후반부("텍스트도 달라질 수 있음")에 대비해, 나중에 필요해지면 `i18n.js`
키 조회 시 variant suffix를 우선 시도하는 fallback만 추가하면 된다:

```js
// 확장 시 적용 (지금은 미구현)
var key = variant !== 'master' ? baseKey + '__' + variant : baseKey;
I18N[lang][key] || I18N[lang][baseKey]
```

이 컨벤션만 문서에 남겨두고, 실제 variant별 텍스트가 필요해지기 전까지는 코드에
분기를 추가하지 않는다 (YAGNI — 지금 만들면 쓰이지 않는 분기만 늘어남).

## 범위

- **포함**: Projects 엔트리 순서, Skills bullet 순서. 화면+인쇄 양쪽.
- **제외 (이번 설계 범위 밖)**: Stack/Careers/OSS 등 다른 섹션 순서 변경, variant별
  텍스트 실제 차이, side-nav 섹션 자체의 순서(8개 섹션 순서는 고정 유지).

## 에러 처리

- `?v=` 없음 또는 알 수 없는 값 → `master`로 폴백, 콘솔 에러 없음.
- `PROJECT_ORDER[variant]`에 없는 id가 실수로 들어가면 해당 항목은 렌더링에서
  누락되므로, 배열 값은 항상 `PROJECT_META`에 정의된 id와 1:1 대응해야 함.
- `PROJECT_META[id].bullets`가 가리키는 키(`projects.${id}.li*`)가 `i18n.js`
  ko/en 양쪽에 없으면 해당 `<li>`가 빈 텍스트로 렌더링됨 — 구현 단계에서 스키마
  작성 직후 ko/en 키 존재 여부를 한 번 육안 대조한다(개인 이력서 사이트 규모라
  자동 검증 스크립트까진 두지 않음).

## 테스트 / 검증 계획

수동 확인 (별도 자동화 테스트 인프라 없는 정적 사이트라 아래로 충분):
1. `?v=master`, `?v=backend`, `?v=ai`, 파라미터 없음, `?v=invalid` 5가지로 접속 →
   화면판 프로젝트/skills 순서가 각 배열과 일치하는지 육안 확인.
2. 각 variant에서 브라우저 인쇄 미리보기 열어 인쇄판도 동일 순서로 나오는지, 기존
   페이지네이션(페이지 나뉨 위치)이 깨지지 않는지 확인.
3. 리팩터 전/후 diff: `p1`·`p3`는 bullet 2개, `p4`는 bullet 3개가 화면·인쇄
   양쪽에서 그대로 유지되는지 (리팩터 전 스크린샷과 대조해 bullet 누락 없는지
   확인 — Codex 리뷰에서 지적된 콘텐츠 유실 위험 재발 방지).
4. 언어 토글(한/영) 클릭 후에도 변경된 순서가 유지되는지 확인 (변수 `variant`는
   `applyLang` 재호출과 무관하게 고정되어야 함).
5. 다크모드 전환과 병행 확인 (기존 기능 회귀 없는지).

## 향후 확장 메모

- variant별 텍스트 차이 필요해지면: 위 "확장 포인트" fallback 로직 추가 + i18n.js에
  `__backend`/`__ai` suffix 키만 필요한 곳에 추가.
- variant 개수 늘어나면: `VARIANTS` 배열, `PROJECT_ORDER`/`SKILLS_ORDER`에 키 하나씩
  추가만 하면 됨 (렌더링 로직 변경 불필요).
