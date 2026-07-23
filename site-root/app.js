(function () {
  var NAV_ORDER = [
    { id: 'about', color: 'var(--sky)' },
    { id: 'skills', color: 'var(--blue)', num: 1 },
    { id: 'stack', color: 'var(--green)', num: 2 },
    { id: 'projects', color: 'var(--purple)', num: 3 },
    { id: 'careers', color: 'var(--red)', num: 4 },
    { id: 'oss', color: 'var(--teal)', num: 5 },
    { id: 'education', color: 'var(--gold)', num: 6 },
    { id: 'certs', color: 'var(--sky)', num: 7 },
    { id: 'etc', color: 'var(--orange)', num: 8 },
  ];
  var sideNav = document.getElementById('side-nav');
  NAV_ORDER.forEach(function (entry) {
    var btn = document.createElement('button');
    btn.type = 'button';
    btn.dataset.target = entry.id;
    btn.dataset.i18nNav = 'side.' + entry.id;
    btn.style.setProperty('--dot-color', entry.color);
    if (entry.num) {
      var num = document.createElement('span');
      num.className = 'nav-num';
      num.textContent = entry.num;
      btn.appendChild(num);
    } else {
      var dot = document.createElement('span');
      dot.className = 'section-dot';
      dot.style.background = entry.color;
      btn.appendChild(dot);
    }
    var label = document.createElement('span');
    label.className = 'nav-label';
    btn.appendChild(label);
    btn.addEventListener('click', function () {
      document.getElementById(entry.id).scrollIntoView({ behavior: 'smooth', block: 'start' });
    });
    sideNav.appendChild(btn);
  });

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

  function renderResume() {
    var projectIds = VARIANT_CONFIG[variant].projects;
    var skillIds = VARIANT_CONFIG[variant].skills;

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

  var currentLang = 'ko';
  function wrapPrintMetaLine(el) {
    var isPrint = el.classList.contains('pr-tech') || el.classList.contains('pr-link');
    var isScreen = el.classList.contains('tech') || el.classList.contains('link');
    if (!isPrint && !isScreen) return;
    var wrapperClass = isPrint ? 'pr-line-content' : 'line-content';
    var label = el.querySelector('b');
    if (!label || label.nextElementSibling && label.nextElementSibling.className === wrapperClass) return;

    var content = document.createElement('span');
    content.className = wrapperClass;
    while (label.nextSibling) {
      content.appendChild(label.nextSibling);
    }
    if (content.firstChild && content.firstChild.nodeType === Node.TEXT_NODE) {
      content.firstChild.nodeValue = content.firstChild.nodeValue.replace(/^\s+/, '');
    }
    el.appendChild(content);
  }

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
    sideNav.querySelectorAll('button').forEach(function (btn) {
      var key = btn.getAttribute('data-i18n-nav');
      btn.querySelector('.nav-label').textContent = I18N[lang][key] || '';
    });
    document.getElementById('lang-ko').setAttribute('aria-pressed', String(lang === 'ko'));
    document.getElementById('lang-en').setAttribute('aria-pressed', String(lang === 'en'));
    document.documentElement.lang = lang;
  }
  document.getElementById('lang-ko').addEventListener('click', function () { applyLang('ko'); });
  document.getElementById('lang-en').addEventListener('click', function () { applyLang('en'); });
  renderResume(); // must run before applyLang() so the generated data-i18n nodes get filled with text
  applyLang(localStorage.getItem('lang') === 'en' ? 'en' : 'ko');

  var root = document.documentElement;
  var themeToggle = document.getElementById('theme-toggle');
  function systemDark() { return window.matchMedia('(prefers-color-scheme: dark)').matches; }
  function syncThemeIcon() {
    var current = root.getAttribute('data-theme');
    var isDark = current ? current === 'dark' : systemDark();
    themeToggle.textContent = isDark ? '☀️' : '🌙';
  }
  var storedTheme = localStorage.getItem('theme');
  if (storedTheme === 'light' || storedTheme === 'dark') root.setAttribute('data-theme', storedTheme);
  syncThemeIcon();
  themeToggle.addEventListener('click', function () {
    var current = root.getAttribute('data-theme');
    var isDark = current ? current === 'dark' : systemDark();
    var next = isDark ? 'light' : 'dark';
    root.setAttribute('data-theme', next);
    localStorage.setItem('theme', next);
    syncThemeIcon();
  });
  document.getElementById('print-btn').addEventListener('click', function () {
    window.print();
  });

  var sections = NAV_ORDER.map(function (entry) { return document.getElementById(entry.id); });
  var navButtons = Array.prototype.slice.call(sideNav.querySelectorAll('button'));

  var progressFill = document.getElementById('progress-fill');

  var revealEls = Array.prototype.slice.call(
    document.querySelectorAll('.section-body li, .section-body p')
  );
  revealEls.forEach(function (el) { el.setAttribute('data-reveal', ''); });

  function updateActiveSection() {
    var idx = -1;
    sections.forEach(function (s, i) {
      if (s.getBoundingClientRect().top < 160) idx = i;
    });
    var doc = document.documentElement;
    var maxScroll = doc.scrollHeight - window.innerHeight;
    if (maxScroll > 0 && window.scrollY >= maxScroll - 4) idx = sections.length - 1;
    navButtons.forEach(function (b, i) { b.classList.toggle('active', i === idx); });

    var pct = maxScroll > 0 ? Math.min(1, window.scrollY / maxScroll) : 1;
    progressFill.style.width = Math.round(pct * 100) + '%';

    var revealThreshold = window.innerHeight * 0.95;
    revealEls.forEach(function (el) {
      if (!el.classList.contains('revealed') && el.getBoundingClientRect().top < revealThreshold) {
        el.classList.add('revealed');
      }
    });
  }

  var ticking = false;
  window.addEventListener('scroll', function () {
    if (ticking) return;
    ticking = true;
    requestAnimationFrame(function () { ticking = false; updateActiveSection(); });
  }, { passive: true });
  window.addEventListener('resize', updateActiveSection, { passive: true });
  updateActiveSection();
})();
