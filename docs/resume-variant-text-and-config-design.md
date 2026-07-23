# 이력서 Variant 문구 지원 및 설정 구조 통합 설계

## 배경 / 목적

[resume-position-variant-design.md](resume-position-variant-design.md)에서 구현한 `?v=master|backend|ai`는 프로젝트/역량 노출 **순서**만 바꿨다. 이번 작업은 다음 세 가지를 이어서 진행한다.

1. backend/ai variant의 순서값 최종 확정 (실은 변경 없음 — 아래 참고)
2. Variant별로 실제 **문구가 달라질 수 있는** 지원 추가 (지금까지는 순서만 다르고 텍스트는 동일했음)
3. `VARIANT_CONFIG`로 variant 관련 설정을 하나의 구조로 통합하는 리팩터

## 1. 순서값 확정 — 변경 없음

현재 코드의 seed 값을 그대로 최종으로 확정한다.

```
backend: PROJECT_ORDER p3 → p4 → p1, SKILLS_ORDER li1 → li2 → li4 → li3
ai:      PROJECT_ORDER p1 → p3 → p4, SKILLS_ORDER li3 → li1 → li2 → li4
```

"backend → 백엔드 → 백엔드 → AI", "ai → AI → 백엔드 → 백엔드" 패턴으로 각 포지션의 우선순위와 일치. **코드 변경 사항 없음** — 이 항목은 순서값 재검토 결과를 기록해두는 목적.

## 2. Variant별 문구 override

### 2-1. 메커니즘

`applyLang()`의 텍스트 조회를 `getText(lang, key)` 헬퍼로 분리한다.

```js
function getText(lang, key) {
  var overrideKey = key + '__' + variant;
  var text = I18N[lang][overrideKey];
  if (text === undefined) text = I18N[lang][key];
  if (text === undefined) {
    console.warn('i18n: missing key "' + key + '" (variant "' + variant + '", lang "' + lang + '")');
    text = '';
  }
  return text;
}
```

`applyLang()` 내부의 `el.innerHTML = I18N[lang][key] || '';`를 `el.innerHTML = getText(lang, key);`로 교체.

`variant`는 지금 `renderResume()` 안에서만 지역변수로 계산되는데, `applyLang()`도 같은 값을 참조해야 하므로 IIFE 최상단(다른 top-level 변수들 근처, `getVariant()` 정의 직후)으로 끌어올려 한 번만 계산하고 공유한다. `renderResume()`는 자신의 지역 `variant` 선언을 지우고 이 공유 변수를 그대로 쓴다.

**적용 범위는 코드가 아니라 콘텐츠로 결정한다** — `getText`는 모든 `data-i18n` 키에 범용으로 동작하고, 특정 키에 실제로 `키__variant` 오버라이드가 `i18n.js`에 존재하지 않으면 그냥 기존 문구로 폴백한다. 즉 "skills + header만 override 가능"이라는 제약은 이번에 그 키들에만 실제 오버라이드 콘텐츠를 채워 넣는다는 뜻이지, 코드 레벨의 화이트리스트가 아니다.

### 2-2. 실제 문구 (i18n.js에 추가)

프로젝트 bullet은 그대로 유지. `header.tagline`, `header.pitch`, `skills.li3`만 backend/ai variant 오버라이드를 추가한다(li1/li2/li4는 세 variant 모두 의미가 같아 오버라이드 없이 master 문구로 폴백).

| 키 | ko | en |
|---|---|---|
| `header.tagline__backend` | 백엔드 개발자 \| 대규모 트래픽·이벤트 기반 시스템 설계 | Backend Developer \| Large-Scale Traffic & Event-Driven System Design |
| `header.tagline__ai` | 백엔드 개발자 \| LLM·에이전트 기반 자동화 파이프라인 설계 | Backend Developer \| LLM/Agent-Driven Automation Pipeline Design |
| `header.pitch__backend` | 복잡한 트래픽·이벤트 흐름을 `<strong>안정적으로 설계하고 검증</strong>`하는 데 집중합니다.`<br>`문서화와 진행 상황 공유를 습관처럼 실천하며, `<strong>함께 일하기 편한 개발 환경</strong>`을 지향합니다. | I focus on `<strong>designing and verifying complex traffic and event flows for stability at scale</strong>`.`<br>`I treat documentation and status-sharing as habits, aiming for `<strong>a dev environment that's easy to work in together</strong>`. |
| `header.pitch__ai` | LLM·MCP 기반 `<strong>에이전트와 자동화 파이프라인 구축</strong>`에 관심이 많습니다.`<br>`문서화와 진행 상황 공유를 습관처럼 실천하며, `<strong>함께 일하기 편한 개발 환경</strong>`을 지향합니다. | I'm drawn to `<strong>building LLM/MCP-driven agents and automation pipelines</strong>`.`<br>`I treat documentation and status-sharing as habits, aiming for `<strong>a dev environment that's easy to work in together</strong>`. |
| `skills.li3__backend` | `<b>AI 활용 자동화</b>` LLM·MCP로 반복 업무 자동화, 백엔드 개발 생산성 향상 | `<b>AI-Assisted Automation</b>` Automating repetitive work with LLM/MCP to boost backend dev productivity |
| `skills.li3__ai` | `<b>AI Agent Engineering</b>` LLM·MCP 기반 에이전트 설계, 자동화 파이프라인 구축·운영, 지식 통합 | `<b>AI Agent Engineering</b>` Agent design on LLM/MCP, building & operating automation pipelines, knowledge integration |

`master` variant는 오버라이드가 없어 기존 `header.tagline`/`header.pitch`/`skills.li3` 문구를 그대로 사용 — 지금까지의 기본 노출과 동일.

## 3. `VARIANT_CONFIG` 통합 리팩터

`VARIANTS` 배열, `PROJECT_ORDER`, `SKILLS_ORDER` 세 개를 하나로 합친다.

```js
var DEFAULT_VARIANT = 'master';

var VARIANT_CONFIG = {
  master:  { projects: ['p1', 'p3', 'p4'], skills: ['li1', 'li2', 'li3', 'li4'] },
  backend: { projects: ['p3', 'p4', 'p1'], skills: ['li1', 'li2', 'li4', 'li3'] },
  ai:      { projects: ['p1', 'p3', 'p4'], skills: ['li3', 'li1', 'li2', 'li4'] },
};

function getVariant() {
  var v = new URLSearchParams(window.location.search).get('v');
  return Object.prototype.hasOwnProperty.call(VARIANT_CONFIG, v) ? v : DEFAULT_VARIANT;
}
```

- `renderResume()`의 `PROJECT_ORDER[variant]` / `SKILLS_ORDER[variant]` 참조를 `VARIANT_CONFIG[variant].projects` / `.skills`로 변경.
- `PROJECT_META`는 variant와 무관한 프로젝트별 bullet 스키마이므로 그대로 별도 유지.
- variant 목록의 단일 소스가 `Object.keys(VARIANT_CONFIG)`가 되어, 새 variant 추가 시 이 객체 하나에만 항목을 추가하면 됨(전에는 `VARIANTS`, `PROJECT_ORDER`, `SKILLS_ORDER` 세 곳을 동기화해야 했음).
- 순수 리팩터 — 동작 변화 없음.

## 구현 순서

브레인스토밍에서 합의한 순서 그대로: **문구 override 먼저, 리팩터 나중.** 두 작업은 서로 다른 코드 경로를 건드려서(문구 override는 `applyLang`/`getText`, 리팩터는 `PROJECT_ORDER`/`SKILLS_ORDER`/`VARIANTS`) 순서를 바꿔도 재작업이 생기지 않는다 — 다만 사용자가 지정한 순서(override 구현 → 리팩터)를 그대로 따른다.

## 범위

- **포함**: `getText()` 헬퍼, `variant` 공유 변수로 끌어올리기, header/skills 오버라이드 키 6개(ko+en 각 6개 = 12개 i18n 키) 추가, `VARIANT_CONFIG` 통합.
- **제외**: 프로젝트 bullet 텍스트 오버라이드(이번 범위 아님, 요청대로 프로젝트 본문은 유지), 새 variant 추가, Timeline↔Resume 통합(별도 후속 작업).

## 에러 처리

- `key__variant` 오버라이드도 base key도 없으면 `console.warn`으로 variant/lang 포함해 경고 후 빈 문자열 렌더링 — 페이지가 깨지지 않고 조용히 눈에 띄는 방식.
- `VARIANT_CONFIG`에 없는 `?v=` 값은 기존과 동일하게 `master`로 폴백(로직은 `Object.prototype.hasOwnProperty` 체크로 바뀌지만 동작은 동일).

## 테스트 / 검증 계획

자동화 테스트 없음(기존과 동일). 수동 확인:

1. `?v=master`(또는 파라미터 없음) — header/skills 문구가 지금까지의 기본 문구와 동일한지(오버라이드 없어 폴백 확인).
2. `?v=backend` — header.tagline/pitch, skills.li3가 backend 초안 문구로 바뀌는지, 나머지 skills(li1/li2/li4)와 프로젝트 bullet은 그대로인지.
3. `?v=ai` — 위와 동일하되 ai 초안 문구로.
4. 언어 토글(ko⇄en) — 각 variant에서 토글해도 해당 variant의 override 문구가 언어별로 올바르게 나오는지.
5. `VARIANT_CONFIG` 리팩터 후 — 세 variant 모두 프로젝트/skills 순서가 리팩터 전과 동일한지(순수 리팩터 회귀 확인).
6. 콘솔에 `i18n: missing key` 경고가 예상 밖으로 뜨지 않는지(오탈자로 override 키를 잘못 적었을 때만 떠야 함).

## 향후 확장

- 프로젝트 bullet까지 variant별 문구가 필요해지면 같은 `key__variant` 컨벤션을 그대로 적용 가능(메커니즘 이미 범용).
- Timeline↔Resume 구조 통합은 [resume-position-variant-log.md](resume-position-variant-log.md) 10-2절에 별도 후보로 기록됨 — 이번 작업 범위 아님.
