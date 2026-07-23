# Resume Position-Variant Ordering Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Let `site-root` (the resume site) show a different project/skill display order depending on a `?v=` URL query param (`master` / `backend` / `ai`), driven from one shared data source so screen and print views can never drift out of sync.

**Architecture:** Move the currently hardcoded project-entry and skills-bullet markup out of `index.html` into data-driven rendering in `app.js`. Order arrays (`PROJECT_ORDER`, `SKILLS_ORDER`) and a content schema (`PROJECT_META`, listing each project's actual bullet keys) drive a small template function that builds identical DOM for the screen block and the print block. Order is baked into real DOM insertion order (not CSS `order`), so the print stylesheet's existing block-flow pagination rules are untouched.

**Tech Stack:** Plain JS (ES5-style, no build step), matches `site-root/app.js`'s existing conventions (`var`, `function`, string concatenation, no template literals, no framework).

**Reference:** Design spec at `docs/resume-position-variant-design.md`.

## Global Constraints

- No build step in `site-root/` — `index.html`/`style.css`/`app.js`/`i18n.js` are served as-is (AGENTS.md).
- Keep both ko/en locales in sync in `i18n.js` (AGENTS.md) — this plan does not add or change any i18n text, only reorders existing keys, so no locale sync work is needed.
- No test suite exists for `site-root/` — verify manually in a browser (AGENTS.md). Each task below ends with a concrete manual browser-console check instead of an automated test run.
- Don't introduce a build step or new dependency into `site-root/` (AGENTS.md: "styling in `site-root/` is plain CSS — don't introduce a build step there"; same spirit applies to JS).
- `?v=` invalid or missing must fall back to `master` silently (design spec "에러 처리").
- Variant must NOT be persisted to `localStorage` — unlike the language toggle, it must always come from the URL so a shared link opens in the intended variant (design spec).
- Project bullet counts differ per project (`p1`→2, `p3`→2, `p4`→3) and must be preserved exactly — this was the specific gap flagged by Codex adversarial review on the design doc.
- **No committed state may leave the live resume's Projects/Skills sections empty.** This repo deploys to GitHub Pages from CI, so every commit is a potential deploy candidate. HTML markup that removes the hardcoded entries and the JS that repopulates them must land in the *same* commit — this was flagged by Codex adversarial review on an earlier draft of this plan (a version that committed the emptied HTML before the renderer existed) and is why Task 3 below is one atomic task instead of split across "remove markup" / "wire renderer" commits.

---

## File Structure

- **Modify `site-root/app.js`**: add variant data/constants, `getVariant()`, two template functions (`renderProjectEntry`, `renderSkillLi`) — all pure additions, unused until Task 3, so the page keeps working unchanged through Tasks 1-2. Then add a `renderResume()` orchestrator and call it once at startup, before the existing `applyLang(...)` call (so `data-i18n` text-fill still finds every generated element).
- **Modify `site-root/index.html`**: remove hardcoded project-entry (`.entry`/`.pr-entry`) and skills-bullet (`<li>`) markup from both the screen block (`#projects`, `#skills`) and print block (`#print-resume`), replacing them with empty containers carrying new `id`s. This happens in the same task/commit as wiring `renderResume()` in, so the page is never in a state where content is removed but not yet regenerated.
- **Modify `site-root/CHANGELOG.md`**: log this structural change per repo convention (CHANGELOG tracks resume-facing edits).
- **No changes** to `i18n.js` (all needed keys already exist) or `style.css` (DOM classes/structure per variant are identical to today's markup, just assembled by JS instead of hand-written).

---

### Task 1: Add variant data and `getVariant()` to `app.js`

This task only *adds* code — nothing in it is called yet, so the page's current behavior (hardcoded markup, no `?v=` support) is unchanged after this commit. Safe to commit and even deploy on its own.

**Files:**
- Modify: `site-root/app.js:38-40` (insert new block between the `NAV_ORDER.forEach` loop and `var currentLang = 'ko';`)

**Interfaces:**
- Consumes: nothing (pure data + a URL parser).
- Produces: `VARIANTS` (array), `DEFAULT_VARIANT` (string), `PROJECT_META` (object keyed by project id → `{ bullets: [...] }`), `PROJECT_ORDER` (object keyed by variant → array of project ids), `SKILLS_ORDER` (object keyed by variant → array of skill-key suffixes), `getVariant()` (function, no args, returns one of `VARIANTS`). All consumed by Task 2/3.

- [ ] **Step 1: Insert variant data block**

In `site-root/app.js`, right after the closing `});` of the `NAV_ORDER.forEach(...)` loop (line 38) and before `var currentLang = 'ko';` (line 40), insert:

```js
  var VARIANTS = ['master', 'backend', 'ai'];
  var DEFAULT_VARIANT = 'master';

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
```

Note on the seed order values: these are real, usable defaults (backend variant leads with the two backend-heavy projects and pushes the AI project last; ai variant keeps the AI project first). They are plain data — changing them later means editing one array, no render-logic changes needed.

- [ ] **Step 2: Manual check — page still works exactly as before, `getVariant()` resolves correctly**

Open `site-root/index.html` in a browser. Expected: page looks identical to before this change (all project/skill entries still hardcoded and visible) — this task added dead code only.

In DevTools console:
```js
getVariant()                                    // no ?v= in URL
```
Expected: `"master"`.

Append `?v=backend` to the URL and reload, rerun:
```js
getVariant()
```
Expected: `"backend"`.

Try `?v=bogus` and reload:
```js
getVariant()
```
Expected: `"master"` (invalid falls back to default).

- [ ] **Step 3: Commit**

```bash
git add site-root/app.js
git commit -m "feat(resume): add variant order data and getVariant()"
```

---

### Task 2: Add `renderProjectEntry` and `renderSkillLi` template functions

Also pure addition — still unused, page behavior still unchanged after this commit.

**Files:**
- Modify: `site-root/app.js` (insert directly after the block added in Task 1, still before `var currentLang = 'ko';`)

**Interfaces:**
- Consumes: `PROJECT_META` (from Task 1).
- Produces: `renderProjectEntry(id, mode)` — `id` is a project key (`'p1'`/`'p3'`/`'p4'`), `mode` is `'screen'` or `'print'`; returns a DOM node ready to append. `renderSkillLi(id, mode)` — `id` is a skill key (`'li1'`..`'li4'`); returns an `<li>` DOM node (mode is accepted for signature symmetry with `renderProjectEntry` but unused, since skill `<li>` markup doesn't differ between screen/print). Both are consumed by Task 3's `renderResume()`.

- [ ] **Step 1: Insert template-helper and template functions**

```js
  function dEl(tag, cls, i18nKey) {
    var el = document.createElement(tag);
    if (cls) el.className = cls;
    if (i18nKey) el.setAttribute('data-i18n', i18nKey);
    return el;
  }

  function renderProjectEntry(id, mode) {
    var isPrint = mode === 'print';
    var wrap = dEl('div', isPrint ? 'pr-entry' : 'entry');

    var head = dEl('div', isPrint ? 'pr-entry-head' : 'entry-head');
    head.appendChild(dEl('h3', null, 'projects.' + id + '.title'));
    head.appendChild(dEl('span', isPrint ? 'pr-entry-period' : 'entry-period', 'projects.' + id + '.date'));
    wrap.appendChild(head);

    wrap.appendChild(dEl('div', isPrint ? 'pr-meta' : 'meta', 'projects.' + id + '.meta'));
    wrap.appendChild(dEl('p', isPrint ? 'pr-quote' : 'quote', 'projects.' + id + '.quote'));

    var ul = document.createElement('ul');
    PROJECT_META[id].bullets.forEach(function (bulletKey) {
      ul.appendChild(dEl('li', null, 'projects.' + id + '.' + bulletKey));
    });
    wrap.appendChild(ul);

    wrap.appendChild(dEl('div', isPrint ? 'pr-tech' : 'tech', 'projects.' + id + '.tech'));
    wrap.appendChild(dEl('div', isPrint ? 'pr-link' : 'link', 'projects.' + id + '.link'));
    return wrap;
  }

  function renderSkillLi(id, mode) {
    return dEl('li', null, 'skills.' + id);
  }
```

- [ ] **Step 2: Manual check — template functions produce the expected markup shape**

Page still shows the old hardcoded content (these functions aren't called yet). In DevTools console:
```js
renderProjectEntry('p4', 'screen').outerHTML
```
Expected: a string starting `<div class="entry"><div class="entry-head"><h3 data-i18n="projects.p4.title">...` and containing exactly 3 `<li data-i18n="projects.p4.li…">` (matches `PROJECT_META.p4.bullets` length).

```js
renderProjectEntry('p1', 'print').outerHTML
```
Expected: starts `<div class="pr-entry">...`, contains exactly 2 `<li data-i18n="projects.p1.li…">`.

```js
renderSkillLi('li3', 'screen').outerHTML
```
Expected: `<li data-i18n="skills.li3"></li>`.

- [ ] **Step 3: Commit**

```bash
git add site-root/app.js
git commit -m "feat(resume): add project/skill entry template functions"
```

---

### Task 3: Atomic switch-over — strip hardcoded markup and wire `renderResume()` in one commit

This is the one task that changes visible behavior. HTML removal and JS wiring happen as one set of edits, verified together, and committed together — at no point in git history does a commit exist where the containers are empty but nothing fills them. Do not run `git commit` until Step 6 (verification) passes.

**Files:**
- Modify: `site-root/index.html:54` (screen skills `<ul>`)
- Modify: `site-root/index.html:79` (screen projects `.section-body`)
- Modify: `site-root/index.html:216` (print skills `<ul>`)
- Modify: `site-root/index.html:236` (print projects `<section>`)
- Modify: `site-root/app.js` (insert `renderResume()` directly after Task 2's functions, still before `var currentLang = 'ko';`)
- Modify: `site-root/app.js:78` (the existing `applyLang(localStorage.getItem('lang') === 'en' ? 'en' : 'ko');` call)

**Interfaces:**
- Consumes: `getVariant()`, `PROJECT_ORDER`, `SKILLS_ORDER`, `renderProjectEntry()`, `renderSkillLi()` (all from Tasks 1-2).
- Produces: `renderResume()` — no args, no return value, side-effects the DOM. Must run before `applyLang()` so `applyLang`'s `document.querySelectorAll('[data-i18n]')` sees the generated elements. Four DOM containers with stable IDs (`#skills-list`, `#projects-list`, `#pr-skills-list`, `#print-projects`) that `renderResume()` targets by `getElementById`.

- [ ] **Step 1: Add `id="skills-list"` to the screen skills list and remove its hardcoded `<li>`s**

Change (around line 54):
```html
        <ul class="label-list">
          <li data-i18n="skills.li1"></li>
          <li data-i18n="skills.li2"></li>
          <li data-i18n="skills.li3"></li>
          <li data-i18n="skills.li4"></li>
        </ul>
```
to:
```html
        <ul class="label-list" id="skills-list"></ul>
```

- [ ] **Step 2: Add `id="projects-list"` to the screen projects body and remove its three `.entry` blocks**

Change (around line 79):
```html
      <div class="section-body">
        <div class="entry">
          ... (p1 entry) ...
        </div>

        <div class="entry">
          ... (p3 entry) ...
        </div>

        <div class="entry">
          ... (p4 entry) ...
        </div>
      </div>
```
to:
```html
      <div class="section-body" id="projects-list"></div>
```

- [ ] **Step 3: Add `id="pr-skills-list"` to the print skills list and remove its hardcoded `<li>`s**

Change (around line 216):
```html
    <ul class="pr-label-list">
      <li data-i18n="skills.li1"></li>
      <li data-i18n="skills.li2"></li>
      <li data-i18n="skills.li3"></li>
      <li data-i18n="skills.li4"></li>
    </ul>
```
to:
```html
    <ul class="pr-label-list" id="pr-skills-list"></ul>
```

- [ ] **Step 4: Add `id="print-projects"` to the print projects section and remove its three `.pr-entry` blocks**

Change (around line 236):
```html
  <section class="pr-section pr-section-flow">
    <h2 data-i18n="side.projects"></h2>

    <div class="pr-entry">
      ... (p1 entry) ...
    </div>

    <div class="pr-entry">
      ... (p3 entry) ...
    </div>

    <div class="pr-entry">
      ... (p4 entry) ...
    </div>
  </section>
```
to:
```html
  <section class="pr-section pr-section-flow" id="print-projects">
    <h2 data-i18n="side.projects"></h2>
  </section>
```

- [ ] **Step 5: Insert `renderResume()` and call it before `applyLang()`**

Insert (directly after Task 2's `renderSkillLi` function, still before `var currentLang = 'ko';`):

```js
  function renderResume() {
    var variant = getVariant();
    var projectIds = PROJECT_ORDER[variant];
    var skillIds = SKILLS_ORDER[variant];

    var screenProjects = document.getElementById('projects-list');
    var printProjects = document.getElementById('print-projects');
    projectIds.forEach(function (id) {
      screenProjects.appendChild(renderProjectEntry(id, 'screen'));
      printProjects.appendChild(renderProjectEntry(id, 'print'));
    });

    var screenSkills = document.getElementById('skills-list');
    var printSkills = document.getElementById('pr-skills-list');
    skillIds.forEach(function (id) {
      screenSkills.appendChild(renderSkillLi(id, 'screen'));
      printSkills.appendChild(renderSkillLi(id, 'print'));
    });

    console.assert(
      screenProjects.children.length === projectIds.length,
      'renderResume: screen project count mismatch for variant', variant
    );
    console.assert(
      printProjects.children.length === projectIds.length + 1, // +1 for the <h2>
      'renderResume: print project count mismatch for variant', variant
    );
    console.assert(
      screenSkills.children.length === skillIds.length,
      'renderResume: screen skills count mismatch for variant', variant
    );
    console.assert(
      printSkills.children.length === skillIds.length,
      'renderResume: print skills count mismatch for variant', variant
    );
  }
```

Then change (around line 78):
```js
  document.getElementById('lang-ko').addEventListener('click', function () { applyLang('ko'); });
  document.getElementById('lang-en').addEventListener('click', function () { applyLang('en'); });
  applyLang(localStorage.getItem('lang') === 'en' ? 'en' : 'ko');
```
to:
```js
  document.getElementById('lang-ko').addEventListener('click', function () { applyLang('ko'); });
  document.getElementById('lang-en').addEventListener('click', function () { applyLang('en'); });
  renderResume();
  applyLang(localStorage.getItem('lang') === 'en' ? 'en' : 'ko');
```

- [ ] **Step 6: Manual check — full page renders correctly for the default variant (must pass before committing)**

Reload `site-root/index.html` with no query string.
Expected in DevTools console: no `console.assert` failures printed (assertion failures print to console automatically — absence of red assertion output is the pass signal).

Then run:
```js
Array.from(document.querySelectorAll('#projects-list h3')).map(function (h) { return h.getAttribute('data-i18n'); })
```
Expected: `["projects.p1.title", "projects.p3.title", "projects.p4.title"]` (master order).

```js
document.querySelectorAll('#projects-list .entry > ul > li').length
```
Expected: `7` (p1: 2 + p3: 2 + p4: 3).

```js
Array.from(document.querySelectorAll('#skills-list li')).map(function (li) { return li.getAttribute('data-i18n'); })
```
Expected: `["skills.li1", "skills.li2", "skills.li3", "skills.li4"]`.

Visually confirm: project titles and skill bullets show real Korean text (proves `renderResume()` ran before `applyLang()` — if text is empty, the ordering is reversed and needs fixing).

**If any of the above fails, do not commit.** Fix and re-check — this task's entire point is that the working tree never sits in a broken state at a commit boundary.

- [ ] **Step 7: Manual check — `backend` and `ai` variants reorder correctly, print block matches**

Reload with `?v=backend`, run:
```js
Array.from(document.querySelectorAll('#projects-list h3')).map(function (h) { return h.getAttribute('data-i18n'); })
```
Expected: `["projects.p3.title", "projects.p4.title", "projects.p1.title"]`.

```js
Array.from(document.querySelectorAll('#print-projects h3')).map(function (h) { return h.getAttribute('data-i18n'); })
```
Expected: same order as the screen check above (`p3, p4, p1`) — confirms screen and print stayed in sync.

Repeat both checks with `?v=ai`:
Expected screen/print project order: `["projects.p1.title", "projects.p3.title", "projects.p4.title"]` (identical to master — there is currently only one AI-flavored project, so `ai` and `master` project order match by design; this is expected, not a bug).

- [ ] **Step 8: Manual check — print preview and language toggle still work**

With `?v=backend` still in the URL, open the browser print preview (Ctrl+P or the page's own 🖨️ button).
Expected: print preview shows Projects in `p3, p4, p1` order, page breaks look the same as before this change (no entry split oddly across a page — compare against a screenshot taken before this change if unsure).

Click the "English" language toggle.
Expected: text switches to English, project/skill order stays `p3, p4, p1` / whatever `?v=backend` set (order must survive `applyLang` re-runs).

Toggle dark mode.
Expected: no visual regression, no console errors.

- [ ] **Step 9: Commit (only after Steps 6-8 all pass)**

```bash
git add site-root/index.html site-root/app.js
git commit -m "feat(resume): render projects/skills from variant order data

Replaces hardcoded screen/print markup with a shared render pass driven
by ?v=master|backend|ai, so position-targeted resume links show
relevant projects first without duplicating markup. HTML removal and
JS wiring land together so no commit leaves the resume empty."
```

---

### Task 4: Add a CHANGELOG entry

Non-functional, safe to commit separately — doesn't touch anything that affects what's deployed as the live resume content.

**Files:**
- Modify: `site-root/CHANGELOG.md`

- [ ] **Step 1: Add entry to the top of the changelog**

Add to the top of `site-root/CHANGELOG.md` (after the `# CHANGELOG` heading, before the existing first entry):

```markdown
## 2026-07-23 — 포지션별 프로젝트/역량 노출 순서 (`?v=` variant)

- Projects·핵심역량 항목을 `index.html` 하드코딩 대신 `app.js`의 `PROJECT_ORDER`/`SKILLS_ORDER` 배열로 렌더링하도록 변경.
- URL에 `?v=backend` / `?v=ai`를 붙이면 해당 포지션에 맞춘 순서로 노출 (기본값은 `master`, 기존 순서와 동일).
- 화면판·인쇄판이 같은 데이터로 렌더링되어 항상 순서가 일치.

---
```

- [ ] **Step 2: Commit**

```bash
git add site-root/CHANGELOG.md
git commit -m "docs: log position-variant ordering change in resume changelog"
```

---

## Manual Regression Checklist (run once after Task 3, before considering this done)

- [ ] `?v=master` (and no `?v=` at all) — screen + print project/skill order match Task 3 Step 6 expectations.
- [ ] `?v=backend` — screen + print match Task 3 Step 7 expectations.
- [ ] `?v=ai` — screen + print match Task 3 Step 7 expectations.
- [ ] `?v=` with an unknown value (e.g. `?v=nope`) — falls back to `master` order, no console errors.
- [ ] Print preview for all three variants — page breaks look sane (no entry awkwardly split), matches pre-change pagination for the `master` variant specifically (that one must be pixel-for-pixel unchanged since its content/order didn't change).
- [ ] Language toggle (ko ⇄ en) preserves whatever variant/order was active.
- [ ] Dark mode toggle still works, no regressions.
- [ ] No `console.assert` failures logged in any of the above.

### Optional: local server setup if opening `index.html` directly doesn't resolve `/dev-gina/...` asset paths

`index.html` references assets with absolute paths (`/dev-gina/style.css` etc.) because the production site is a GitHub Pages project site served at `https://<user>.github.io/dev-gina/`. If opening the file directly (`file://`) fails to load `style.css`/`app.js`, mirror that path locally:

```powershell
$preview = "$env:TEMP\resume-preview\dev-gina"
New-Item -ItemType Directory -Force $preview | Out-Null
Copy-Item "site-root\*" $preview -Recurse -Force
npx http-server "$env:TEMP\resume-preview" -p 8080
# then visit http://localhost:8080/dev-gina/index.html?v=backend
```
