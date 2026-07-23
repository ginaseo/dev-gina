# Resume Variant Text Override & Config Consolidation Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Let `site-root`'s resume show different wording per `?v=` variant for `header.tagline`, `header.pitch`, and `skills.li3` (currently only order differs, not text), then consolidate the three parallel variant-order objects (`VARIANTS`, `PROJECT_ORDER`, `SKILLS_ORDER`) into one `VARIANT_CONFIG`.

**Architecture:** Add a generic `getText(lang, key)` lookup that tries `key + '__' + variant` before falling back to the plain `key`, so any `data-i18n` element can get variant-specific text just by adding the suffixed key to `i18n.js` — no code branching per field. `variant` moves from a local inside `renderResume()` to a single outer IIFE-scoped variable so `applyLang()` can read the same value. Then, as a separate pure refactor, replace `VARIANTS`/`PROJECT_ORDER`/`SKILLS_ORDER` with one `VARIANT_CONFIG` object keyed by variant, each holding `{ projects, skills }`.

**Tech Stack:** Plain JS (ES5-style, no build step), matches `site-root/app.js`'s existing conventions (`var`, `function`, string concatenation, no template literals).

**Reference:** Design spec at `docs/resume-variant-text-and-config-design.md`.

## Global Constraints

- No build step in `site-root/`; served as-is (AGENTS.md).
- No test suite exists for `site-root/` — verify manually in a browser (AGENTS.md). Each task ends with a manual browser-console check instead of an automated test run.
- `getText()` must apply generically to every `data-i18n` key, not just header/skills — the restriction to header.tagline/pitch and skills.li3 is enforced by which `key__variant` entries actually exist in `i18n.js`, not by a code-level whitelist.
- `variant` must be computed exactly once via `getVariant()` and shared (via outer-scope closure) between `renderResume()` and `applyLang()`/`getText()` — do not recompute it in more than one place.
- If neither `key__variant` nor `key` exists in `I18N[lang]`, `getText()` must `console.warn` (including the key, variant, and lang) and return `''` — never throw.
- `master` variant must render identically to today (no override keys exist for `master`, so everything falls back to the current base text).
- Project bullet text is out of scope — only `header.tagline`, `header.pitch`, `skills.li3` get overrides this round.
- Task 2 (`VARIANT_CONFIG` consolidation) is a pure refactor: after it, all three variants must render the exact same projects/skills order as before the refactor. `PROJECT_META` stays a separate object (per-project bullet schema, unrelated to variant) — do not fold it into `VARIANT_CONFIG`.
- Variant must still not be persisted to `localStorage` (unaffected by this plan, just don't introduce it).

---

## File Structure

- **Modify `site-root/app.js`**: Task 1 hoists `variant` to a shared outer variable, adds `getText(lang, key)`, and wires it into `applyLang()`. Task 2 replaces `VARIANTS`/`PROJECT_ORDER`/`SKILLS_ORDER` with `VARIANT_CONFIG` and updates `getVariant()`/`renderResume()` to use it.
- **Modify `site-root/i18n.js`**: Task 1 adds 12 new keys (6 base-key/variant pairs × ko/en) directly after the existing `skills.li4` line in each language block.
- **No changes** to `index.html`, `style.css`, or `PROJECT_META`.

---

### Task 1: Variant text override (`getText()` + i18n content)

**Files:**
- Modify: `site-root/app.js:62-65` (hoist `variant` right after `getVariant()`)
- Modify: `site-root/app.js:101-104` (remove `renderResume()`'s own local `variant`)
- Modify: `site-root/app.js:138-165` (add `getText()`, wire into `applyLang()`)
- Modify: `site-root/i18n.js:22` (ko block, after `skills.li4`)
- Modify: `site-root/i18n.js:108` (en block, after `skills.li4`)

**Interfaces:**
- Consumes: `getVariant()`, `I18N` (both pre-existing).
- Produces: outer-scope `variant` (string, one of `'master'`/`'backend'`/`'ai'`, computed once) and `getText(lang, key)` (function, returns a string, never `undefined`) — both consumed by Task 2 and by `applyLang()`.

- [ ] **Step 1: Hoist `variant` to a shared outer variable**

Change (around `site-root/app.js:62-66`):
```js
  function getVariant() {
    var v = new URLSearchParams(window.location.search).get('v');
    return VARIANTS.indexOf(v) !== -1 ? v : DEFAULT_VARIANT;
  }

  function dEl(tag, cls, i18nKey) {
```
to:
```js
  function getVariant() {
    var v = new URLSearchParams(window.location.search).get('v');
    return VARIANTS.indexOf(v) !== -1 ? v : DEFAULT_VARIANT;
  }

  var variant = getVariant();

  function dEl(tag, cls, i18nKey) {
```

- [ ] **Step 2: Remove `renderResume()`'s own local `variant` (use the shared one)**

Change (around `site-root/app.js:101-104`):
```js
  function renderResume() {
    var variant = getVariant();
    var projectIds = PROJECT_ORDER[variant];
    var skillIds = SKILLS_ORDER[variant];
```
to:
```js
  function renderResume() {
    var projectIds = PROJECT_ORDER[variant];
    var skillIds = SKILLS_ORDER[variant];
```

- [ ] **Step 3: Add `getText()` and wire it into `applyLang()`**

Change (around `site-root/app.js:158-165`):
```js
  function applyLang(lang) {
    currentLang = lang;
    localStorage.setItem('lang', lang);
    document.querySelectorAll('[data-i18n]').forEach(function (el) {
      var key = el.getAttribute('data-i18n');
      el.innerHTML = I18N[lang][key] || '';
      wrapPrintMetaLine(el);
    });
```
to:
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

  function applyLang(lang) {
    currentLang = lang;
    localStorage.setItem('lang', lang);
    document.querySelectorAll('[data-i18n]').forEach(function (el) {
      var key = el.getAttribute('data-i18n');
      el.innerHTML = getText(lang, key);
      wrapPrintMetaLine(el);
    });
```

Note: the `sideNav` label loop just below (`btn.querySelector('.nav-label').textContent = I18N[lang][key] || '';`) is NOT part of this change — nav labels have no variant overrides in scope, leave that line as-is.

- [ ] **Step 4: Add ko override content to `i18n.js`**

Change (around `site-root/i18n.js:19-22`):
```js
    'skills.li1': '<b>성능 최적화</b> 측정 기반 병목 분석·캐시 정합성 설계로 조회 p95 98.7% 개선',
    'skills.li2': '<b>이벤트 기반 시스템</b> Kafka·Outbox 기반 데이터 정합성 설계 및 이벤트 채널 분리',
    'skills.li3': '<b>AI Engineering</b> LLM·MCP 활용 개발 자동화 및 무인 파이프라인 구축',
    'skills.li4': '<b>공공 시스템 운영</b> 공공·연구기관 백엔드 개발·운영 (8개 시스템)',
```
to (append the 6 new keys directly after `skills.li4`, keep the 4 existing lines untouched):
```js
    'skills.li1': '<b>성능 최적화</b> 측정 기반 병목 분석·캐시 정합성 설계로 조회 p95 98.7% 개선',
    'skills.li2': '<b>이벤트 기반 시스템</b> Kafka·Outbox 기반 데이터 정합성 설계 및 이벤트 채널 분리',
    'skills.li3': '<b>AI Engineering</b> LLM·MCP 활용 개발 자동화 및 무인 파이프라인 구축',
    'skills.li4': '<b>공공 시스템 운영</b> 공공·연구기관 백엔드 개발·운영 (8개 시스템)',
    'header.tagline__backend': '백엔드 개발자 | 대규모 트래픽·이벤트 기반 시스템 설계',
    'header.tagline__ai': '백엔드 개발자 | LLM·에이전트 기반 자동화 파이프라인 설계',
    'header.pitch__backend': '복잡한 트래픽·이벤트 흐름을 <strong>안정적으로 설계하고 검증</strong>하는 데 집중합니다.<br>문서화와 진행 상황 공유를 습관처럼 실천하며, <strong>함께 일하기 편한 개발 환경</strong>을 지향합니다.',
    'header.pitch__ai': 'LLM·MCP 기반 <strong>에이전트와 자동화 파이프라인 구축</strong>에 관심이 많습니다.<br>문서화와 진행 상황 공유를 습관처럼 실천하며, <strong>함께 일하기 편한 개발 환경</strong>을 지향합니다.',
    'skills.li3__backend': '<b>AI 활용 자동화</b> LLM·MCP로 반복 업무 자동화, 백엔드 개발 생산성 향상',
    'skills.li3__ai': '<b>AI Agent Engineering</b> LLM·MCP 기반 에이전트 설계, 자동화 파이프라인 구축·운영, 지식 통합',
```

- [ ] **Step 5: Add en override content to `i18n.js`**

Change (around `site-root/i18n.js:105-108`):
```js
    'skills.li1': '<b>Performance Optimization</b> Measurement-driven bottleneck analysis and cache-consistency design, p95 improved 98.7%',
    'skills.li2': '<b>Event-Driven Systems</b> Kafka/Outbox-based data consistency design and event-channel separation',
    'skills.li3': '<b>AI Engineering</b> LLM/MCP-driven development automation and unattended pipelines',
    'skills.li4': '<b>Public-Sector Operations</b> Backend development and operations for public/research institutions (8 systems)',
```
to (append the 6 new keys directly after `skills.li4`, keep the 4 existing lines untouched):
```js
    'skills.li1': '<b>Performance Optimization</b> Measurement-driven bottleneck analysis and cache-consistency design, p95 improved 98.7%',
    'skills.li2': '<b>Event-Driven Systems</b> Kafka/Outbox-based data consistency design and event-channel separation',
    'skills.li3': '<b>AI Engineering</b> LLM/MCP-driven development automation and unattended pipelines',
    'skills.li4': '<b>Public-Sector Operations</b> Backend development and operations for public/research institutions (8 systems)',
    'header.tagline__backend': 'Backend Developer | Large-Scale Traffic & Event-Driven System Design',
    'header.tagline__ai': 'Backend Developer | LLM/Agent-Driven Automation Pipeline Design',
    'header.pitch__backend': 'I focus on <strong>designing and verifying complex traffic and event flows for stability at scale</strong>.<br>I treat documentation and status-sharing as habits, aiming for <strong>a dev environment that\'s easy to work in together</strong>.',
    'header.pitch__ai': 'I\'m drawn to <strong>building LLM/MCP-driven agents and automation pipelines</strong>.<br>I treat documentation and status-sharing as habits, aiming for <strong>a dev environment that\'s easy to work in together</strong>.',
    'skills.li3__backend': '<b>AI-Assisted Automation</b> Automating repetitive work with LLM/MCP to boost backend dev productivity',
    'skills.li3__ai': '<b>AI Agent Engineering</b> Agent design on LLM/MCP, building & operating automation pipelines, knowledge integration',
```

- [ ] **Step 6: Manual check — `master` variant unchanged, no `getText` warnings**

Open `site-root/index.html` with no `?v=` (or `?v=master`) in a browser. In DevTools console, confirm no `i18n: missing key` warnings printed. Confirm the header tagline/pitch and `skills.li3` text look exactly like they did before this change (no override exists for `master`, so `getText` falls through to the base key).

```js
getText('ko', 'header.tagline')
```
Expected: `"백엔드 개발자 | AI를 활용한 업무 자동화"` (unchanged base text — no `header.tagline__master` key exists, so it falls back).

- [ ] **Step 7: Manual check — `backend` and `ai` variants show the new copy**

Reload with `?v=backend`. In console:
```js
getText('ko', 'header.tagline')
```
Expected: `"백엔드 개발자 | 대규모 트래픽·이벤트 기반 시스템 설계"`.

```js
getText('ko', 'skills.li3')
```
Expected: `"<b>AI 활용 자동화</b> LLM·MCP로 반복 업무 자동화, 백엔드 개발 생산성 향상"`.

Reload with `?v=ai`, repeat:
```js
getText('ko', 'header.tagline')
```
Expected: `"백엔드 개발자 | LLM·에이전트 기반 자동화 파이프라인 설계"`.

```js
getText('ko', 'skills.li3')
```
Expected: `"<b>AI Agent Engineering</b> LLM·MCP 기반 에이전트 설계, 자동화 파이프라인 구축·운영, 지식 통합"`.

Visually confirm on the page (not just console): `skills.li1`, `skills.li2`, `skills.li4` still show the original master text in both `backend` and `ai` variants (no override keys exist for those, so they fall back correctly), and project bullets are unchanged.

- [ ] **Step 8: Manual check — language toggle still works per variant**

With `?v=ai` still in the URL, click the "English" toggle. Confirm `header.tagline`/`header.pitch`/`skills.li3` switch to the English `ai` override text (not the Korean one, not the English `master` text). Toggle back to Korean, confirm it returns to the Korean `ai` override text.

- [ ] **Step 9: Commit**

```bash
git add site-root/app.js site-root/i18n.js
git commit -m "feat(resume): add variant text overrides for header/skills.li3

Adds a generic getText(lang, key) lookup that tries key__variant before
falling back to key, and populates backend/ai draft copy for
header.tagline, header.pitch, and skills.li3. Project bullets and the
other skills lines are unchanged, falling back to the master text."
```

---

### Task 2: `VARIANT_CONFIG` consolidation (pure refactor)

**Files:**
- Modify: `site-root/app.js:40-65` (replace `VARIANTS`/`PROJECT_ORDER`/`SKILLS_ORDER` with `VARIANT_CONFIG`, update `getVariant()`)
- Modify: `site-root/app.js:101-105` (update `renderResume()` to read from `VARIANT_CONFIG`)

**Interfaces:**
- Consumes: nothing new — this is a pure reshaping of data Task 1 already relies on (`variant`, `PROJECT_META` untouched).
- Produces: `VARIANT_CONFIG` (object keyed by variant → `{ projects: string[], skills: string[] }`), replacing `VARIANTS`, `PROJECT_ORDER`, `SKILLS_ORDER`. `getVariant()`'s signature and return type are unchanged (still returns one of `'master'`/`'backend'`/`'ai'`), only its internal validity check changes.

- [ ] **Step 1: Replace `VARIANTS`/`PROJECT_ORDER`/`SKILLS_ORDER` with `VARIANT_CONFIG`**

Change (around `site-root/app.js:40-66`, this is the state after Task 1's Step 1 already added `var variant = getVariant();` below `getVariant()`):
```js
  var VARIANTS = ['master', 'backend', 'ai'];
  var DEFAULT_VARIANT = 'master';

  // Every id used in PROJECT_ORDER/SKILLS_ORDER below must have a matching entry here (renderResume throws otherwise).
  var PROJECT_META = {
    p1: { bullets: ['li1', 'li2'] },
    p3: { bullets: ['li1', 'li2'] },
    p4: { bullets: ['li1', 'li2', 'li3'] },
  };

  var PROJECT_ORDER = {
    master:  ['p1', 'p3', 'p4'],
    backend: ['p3', 'p4', 'p1'],
    ai:      ['p1', 'p3', 'p4'],
  };

  var SKILLS_ORDER = {
    master:  ['li1', 'li2', 'li3', 'li4'],
    backend: ['li1', 'li2', 'li4', 'li3'],
    ai:      ['li3', 'li1', 'li2', 'li4'],
  };

  function getVariant() {
    var v = new URLSearchParams(window.location.search).get('v');
    return VARIANTS.indexOf(v) !== -1 ? v : DEFAULT_VARIANT;
  }

  var variant = getVariant();
```
to:
```js
  var DEFAULT_VARIANT = 'master';

  // Every id used in VARIANT_CONFIG[*].projects below must have a matching entry here (renderResume throws otherwise).
  var PROJECT_META = {
    p1: { bullets: ['li1', 'li2'] },
    p3: { bullets: ['li1', 'li2'] },
    p4: { bullets: ['li1', 'li2', 'li3'] },
  };

  var VARIANT_CONFIG = {
    master:  { projects: ['p1', 'p3', 'p4'], skills: ['li1', 'li2', 'li3', 'li4'] },
    backend: { projects: ['p3', 'p4', 'p1'], skills: ['li1', 'li2', 'li4', 'li3'] },
    ai:      { projects: ['p1', 'p3', 'p4'], skills: ['li3', 'li1', 'li2', 'li4'] },
  };

  function getVariant() {
    var v = new URLSearchParams(window.location.search).get('v');
    return Object.prototype.hasOwnProperty.call(VARIANT_CONFIG, v) ? v : DEFAULT_VARIANT;
  }

  var variant = getVariant();
```

- [ ] **Step 2: Update `renderResume()` to read from `VARIANT_CONFIG`**

Change (around `site-root/app.js:101-104`, this is the state after Task 1's Step 2 already removed the local `variant`):
```js
  function renderResume() {
    var projectIds = PROJECT_ORDER[variant];
    var skillIds = SKILLS_ORDER[variant];
```
to:
```js
  function renderResume() {
    var projectIds = VARIANT_CONFIG[variant].projects;
    var skillIds = VARIANT_CONFIG[variant].skills;
```

- [ ] **Step 3: Manual check — `getVariant()` behavior unchanged**

In DevTools console (page loaded, no `?v=`):
```js
getVariant()
```
Expected: `"master"`.

Reload with `?v=backend`, `?v=ai`, `?v=bogus` in turn, rerun `getVariant()` each time.
Expected: `"backend"`, `"ai"`, `"master"` respectively (identical to before this refactor).

```js
Object.keys(VARIANT_CONFIG)
```
Expected: `["master", "backend", "ai"]`.

- [ ] **Step 4: Manual check — regression, all three variants still render the same order as before this refactor**

For each of `?v=master`, `?v=backend`, `?v=ai`:
```js
Array.from(document.querySelectorAll('#projects-list h3')).map(function (h) { return h.getAttribute('data-i18n'); })
```
Expected (must match Task 1's/the original feature's behavior exactly — this is a pure refactor):
- `master`: `["projects.p1.title", "projects.p3.title", "projects.p4.title"]`
- `backend`: `["projects.p3.title", "projects.p4.title", "projects.p1.title"]`
- `ai`: `["projects.p1.title", "projects.p3.title", "projects.p4.title"]`

```js
Array.from(document.querySelectorAll('#skills-list li')).map(function (li) { return li.getAttribute('data-i18n'); })
```
Expected:
- `master`: `["skills.li1", "skills.li2", "skills.li3", "skills.li4"]`
- `backend`: `["skills.li1", "skills.li2", "skills.li4", "skills.li3"]`
- `ai`: `["skills.li3", "skills.li1", "skills.li2", "skills.li4"]`

Also confirm no `console.assert` failures print, and no `i18n: missing key` warnings (Task 1's `getText` still works correctly after this refactor since it doesn't touch `variant`, `I18N`, or `getText` itself).

- [ ] **Step 5: Commit**

```bash
git add site-root/app.js
git commit -m "refactor(resume): consolidate VARIANTS/PROJECT_ORDER/SKILLS_ORDER into VARIANT_CONFIG

Pure refactor, no behavior change. New variants now only need one entry
added to VARIANT_CONFIG instead of three parallel objects kept in sync."
```

---

## Manual Regression Checklist (run once after Task 2, before considering this done)

- [ ] `?v=master` (and no `?v=` at all) — header/skills text identical to pre-this-plan behavior, no console warnings.
- [ ] `?v=backend` — header.tagline/pitch and skills.li3 show backend copy; skills.li1/li2/li4 and all project bullets unchanged.
- [ ] `?v=ai` — header.tagline/pitch and skills.li3 show ai copy; skills.li1/li2/li4 and all project bullets unchanged.
- [ ] Language toggle (ko⇄en) shows the correct variant-specific text in both languages.
- [ ] Project/skills order for all three variants matches the values in Task 2 Step 4 exactly (refactor regression).
- [ ] No `console.assert` failures or unexpected `i18n: missing key` warnings in any of the above.
- [ ] Print preview for at least one non-master variant shows the overridden header text too (same DOM, so it should — but confirm visually since this is new content, not just new order).
