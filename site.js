/* ============================================================
   PFT Education Hub — behaviour
   Everything is built from the DOM at load, so editing the
   HTML content never requires touching this file.
   ============================================================ */
(function () {
  "use strict";

  var pages = [].slice.call(document.querySelectorAll('.page'));
  var side = document.getElementById('side');
  var scrim = document.getElementById('scrim');
  var prog = document.getElementById('prog');
  var order = pages.map(function (p) { return p.id; });

  function titleOf(id) {
    var p = document.getElementById(id);
    var h = p && p.querySelector('h1');
    if (!h) return id;
    var t = h.innerHTML.replace(/<br\s*\/?>/gi, ' ').replace(/<[^>]+>/g, '');
    return t.replace(/&rsquo;/g, '\u2019').replace(/\s+/g, ' ').trim();
  }
  function chapterOf(id) {
    var link = document.querySelector('.nav a[data-p="' + id + '"]');
    if (!link) return '';
    var grp = link.closest('.grp');
    var h5 = grp && grp.querySelector('h5');
    return h5 ? h5.textContent.trim() : '';
  }
  function accentOf(id) {
    var link = document.querySelector('.nav a[data-p="' + id + '"]');
    return (link && link.getAttribute('data-c')) || '#0F7B75';
  }

  /* ---------- give every h2 an id, and tag the criteria ones ---------- */
  var CRIT = /(criteri|acceptab|repeatab|grading|contraindicat|termination|tolerance|withhold)/i;
  pages.forEach(function (p) {
    var n = 0;
    [].slice.call(p.querySelectorAll('.body > h2')).forEach(function (h) {
      n++;
      if (!h.id) h.id = p.id + '-s' + n;
      if (CRIT.test(h.textContent)) h.setAttribute('data-crit', '1');
    });
  });

  /* ---------- build the sticky chip bar for each page ---------- */
  pages.forEach(function (p) {
    var hs = [].slice.call(p.querySelectorAll('.body > h2'));
    if (hs.length < 3) return;
    var bar = document.createElement('div');
    bar.className = 'chipbar';
    var inner = document.createElement('div');
    inner.className = 'chipbar-in';
    hs.forEach(function (h) {
      var a = document.createElement('a');
      a.href = '#' + h.id;
      a.textContent = h.textContent.trim();
      if (h.getAttribute('data-crit')) a.className = 'crit-c';
      a.addEventListener('click', function (e) {
        e.preventDefault();
        var y = h.getBoundingClientRect().top + window.pageYOffset - 108;
        window.scrollTo({ top: y, behavior: 'smooth' });
        history.replaceState(null, '', '#' + p.id);
      });
      inner.appendChild(a);
    });
    bar.appendChild(inner);
    var body = p.querySelector('.body');
    p.insertBefore(bar, body);
  });

  /* ---------- prev / next ---------- */
  pages.forEach(function (p, i) {
    if (p.id === 'home') return;
    var pager = document.createElement('nav');
    pager.className = 'pager';
    var prev = order[i - 1], next = order[i + 1];
    function make(id, kind) {
      var a = document.createElement('a');
      if (!id) { a.className = 'ghost'; a.innerHTML = '&nbsp;'; return a; }
      a.href = '#' + id;
      a.className = kind === 'next' ? 'nx' : '';
      a.innerHTML = '<span class="k">' + (kind === 'next' ? 'Next' : 'Previous') +
        '</span><span class="t">' + titleOf(id) + '</span>';
      a.addEventListener('click', function (e) { e.preventDefault(); show(id); });
      return a;
    }
    pager.appendChild(make(prev, 'prev'));
    pager.appendChild(make(next, 'next'));
    p.appendChild(pager);
  });

  /* ---------- page switching ---------- */
  function closeMenu() { side.classList.remove('open'); scrim.classList.remove('on'); }

  function show(id, push) {
    var target = document.getElementById(id);
    if (!target) return;
    pages.forEach(function (p) { p.classList.toggle('on', p === target); });
    [].slice.call(document.querySelectorAll('.nav a')).forEach(function (a) {
      a.classList.toggle('on', a.getAttribute('data-p') === id);
    });
    document.documentElement.style.setProperty('--ch', accentOf(id));
    if (push !== false) history.replaceState(null, '', '#' + id);
    window.scrollTo(0, 0);
    closeMenu();
    document.title = (id === 'home' ? 'PFT Education Hub' : titleOf(id) + ' — PFT Education Hub');
    spy();
  }
  window.__show = show;

  [].slice.call(document.querySelectorAll('[data-p]')).forEach(function (a) {
    a.addEventListener('click', function (e) { e.preventDefault(); show(a.getAttribute('data-p')); });
  });

  var start = (location.hash || '').replace('#', '');
  show(order.indexOf(start) > -1 ? start : 'home', false);

  document.getElementById('burger').addEventListener('click', function () {
    side.classList.toggle('open'); scrim.classList.toggle('on');
  });
  scrim.addEventListener('click', closeMenu);

  /* ---------- scrollspy + progress ---------- */
  function spy() {
    var p = document.querySelector('.page.on');
    if (!p) return;
    var doc = document.documentElement;
    var max = doc.scrollHeight - doc.clientHeight;
    prog.style.width = (max > 0 ? (window.pageYOffset / max) * 100 : 0) + '%';

    var bar = p.querySelector('.chipbar');
    if (!bar) return;
    var hs = [].slice.call(p.querySelectorAll('.body > h2'));
    var cur = hs[0];
    hs.forEach(function (h) {
      if (h.getBoundingClientRect().top <= 140) cur = h;
    });
    var links = [].slice.call(bar.querySelectorAll('a'));
    links.forEach(function (a) {
      var on = a.getAttribute('href') === '#' + (cur && cur.id);
      a.classList.toggle('on', on);
      if (on && bar.querySelector('.chipbar-in').scrollWidth > bar.clientWidth) {
        var box = bar.querySelector('.chipbar-in');
        var want = a.offsetLeft - 20;
        if (Math.abs(box.scrollLeft - want) > 40) box.scrollTo({ left: want, behavior: 'smooth' });
      }
    });
  }
  var tick = false;
  window.addEventListener('scroll', function () {
    if (tick) return;
    tick = true;
    requestAnimationFrame(function () { spy(); tick = false; });
  }, { passive: true });

  /* ---------- search index ---------- */
  var INDEX = [];
  pages.forEach(function (p) {
    var chapter = chapterOf(p.id) || 'Reference';
    var pageTitle = titleOf(p.id);
    var lede = p.querySelector('.lede');
    INDEX.push({
      page: p.id, anchor: null, chapter: chapter, title: pageTitle,
      text: ((lede ? lede.textContent : '') + ' ' + (p.querySelector('.spec') ? p.querySelector('.spec').textContent : '')).replace(/\s+/g, ' ').trim()
    });
    [].slice.call(p.querySelectorAll('.body > h2')).forEach(function (h) {
      var buf = [], n = h.nextElementSibling;
      while (n && n.tagName !== 'H2') {
        if (!n.classList.contains('lgrp')) buf.push(n.textContent);
        n = n.nextElementSibling;
      }
      INDEX.push({
        page: p.id, anchor: h.id, chapter: chapter,
        title: h.textContent.trim(), sub: pageTitle,
        text: buf.join(' ').replace(/\s+/g, ' ').trim()
      });
    });
  });

  var ovl = document.getElementById('ovl');
  var q = document.getElementById('q');
  var res = document.getElementById('res');
  var sel = -1;

  function esc(s) { return s.replace(/[&<>"]/g, function (c) { return ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;' })[c]; }); }

  function snippet(text, term) {
    var i = text.toLowerCase().indexOf(term);
    if (i < 0) return esc(text.slice(0, 150));
    var s = Math.max(0, i - 55);
    var out = (s > 0 ? '…' : '') + text.slice(s, s + 165);
    var re = new RegExp('(' + term.replace(/[.*+?^${}()|[\]\\]/g, '\\$&') + ')', 'ig');
    return esc(out).replace(re, '<mark>$1</mark>');
  }

  function search(term) {
    term = term.trim().toLowerCase();
    if (term.length < 2) { render([], term); return; }
    var hits = [];
    INDEX.forEach(function (r) {
      var t = r.title.toLowerCase(), x = r.text.toLowerCase();
      var score = 0;
      if (t === term) score = 100;
      else if (t.indexOf(term) === 0) score = 80;
      else if (t.indexOf(term) > -1) score = 60;
      else if (x.indexOf(term) > -1) score = 30;
      if (score) hits.push({ r: r, s: score + (r.anchor ? 0 : 5) });
    });
    hits.sort(function (a, b) { return b.s - a.s; });
    render(hits.slice(0, 25).map(function (h) { return h.r; }), term);
  }

  function render(list, term) {
    sel = -1;
    if (!term || term.length < 2) {
      res.innerHTML = '<div class="ovl-empty">Search every section — a test name, a criterion, or a number.<br>Try <strong>repeatability</strong>, <strong>breath-hold</strong> or <strong>z-score</strong>.</div>';
      return;
    }
    if (!list.length) {
      res.innerHTML = '<div class="ovl-empty">Nothing matches “' + esc(term) + '”.</div>';
      return;
    }
    res.innerHTML = list.map(function (r) {
      return '<a class="res" data-page="' + r.page + '" data-anchor="' + (r.anchor || '') + '">' +
        '<div class="rp">' + esc(r.chapter) + (r.sub ? ' · ' + esc(r.sub) : '') + '</div>' +
        '<div class="rt">' + esc(r.title) + '</div>' +
        '<div class="rs">' + snippet(r.text, term) + '</div></a>';
    }).join('');
    [].slice.call(res.querySelectorAll('.res')).forEach(function (a) {
      a.addEventListener('click', function () { go(a); });
    });
  }

  function go(a) {
    var page = a.getAttribute('data-page'), anchor = a.getAttribute('data-anchor');
    closeSearch();
    show(page);
    if (anchor) {
      setTimeout(function () {
        var h = document.getElementById(anchor);
        if (h) window.scrollTo({ top: h.getBoundingClientRect().top + window.pageYOffset - 108, behavior: 'smooth' });
      }, 60);
    }
  }

  function openSearch() {
    ovl.classList.add('on'); q.value = ''; render([], ''); q.focus();
    document.body.style.overflow = 'hidden';
  }
  function closeSearch() { ovl.classList.remove('on'); document.body.style.overflow = ''; }

  document.getElementById('searchbtn').addEventListener('click', openSearch);
  var cta = document.getElementById('searchcta');
  if (cta) cta.addEventListener('click', openSearch);
  document.getElementById('searchbtn2').addEventListener('click', openSearch);
  document.getElementById('ovlbg').addEventListener('click', closeSearch);
  q.addEventListener('input', function () { search(q.value); });

  document.addEventListener('keydown', function (e) {
    if ((e.key === 'k' && (e.metaKey || e.ctrlKey)) || (e.key === '/' && !/input|textarea/i.test(document.activeElement.tagName))) {
      e.preventDefault(); openSearch(); return;
    }
    if (!ovl.classList.contains('on')) return;
    if (e.key === 'Escape') { closeSearch(); return; }
    var items = [].slice.call(res.querySelectorAll('.res'));
    if (!items.length) return;
    if (e.key === 'ArrowDown' || e.key === 'ArrowUp') {
      e.preventDefault();
      sel += (e.key === 'ArrowDown' ? 1 : -1);
      if (sel < 0) sel = items.length - 1;
      if (sel >= items.length) sel = 0;
      items.forEach(function (x, i) { x.classList.toggle('sel', i === sel); });
      items[sel].scrollIntoView({ block: 'nearest' });
    }
    if (e.key === 'Enter') { e.preventDefault(); go(items[sel < 0 ? 0 : sel]); }
  });

  /* ---------- competency checklist ---------- */
  var boxes = [].slice.call(document.querySelectorAll('[data-ck] input'));
  var ckcount = document.getElementById('ckcount');
  function tally() {
    if (!ckcount) return;
    ckcount.textContent = boxes.filter(function (b) { return b.checked; }).length + ' of ' + boxes.length + ' complete';
  }
  boxes.forEach(function (b) {
    b.addEventListener('change', function () {
      b.closest('li').classList.toggle('done', b.checked); tally();
    });
  });
  var ckreset = document.getElementById('ckreset');
  if (ckreset) ckreset.addEventListener('click', function () {
    boxes.forEach(function (b) { b.checked = false; b.closest('li').classList.remove('done'); });
    tally();
  });
  tally();

  /* ---------- self-test ---------- */
  var Q = window.__QUIZ || [];
  var body = document.getElementById('quizbody');
  var scoreEl = document.getElementById('score');
  var endEl = document.getElementById('quizend');
  var answered = 0, correct = 0;

  function updateScore() {
    if (!scoreEl) return;
    scoreEl.textContent = 'Answered ' + answered + ' of ' + Q.length + ' · ' + correct + ' correct';
    if (!endEl) return;
    if (answered === Q.length && Q.length) {
      var pct = Math.round(correct / Q.length * 100);
      endEl.textContent = 'Finished — ' + correct + ' of ' + Q.length + ' (' + pct + '%). ' +
        (pct >= 90 ? 'Ready for a competency review.' :
          pct >= 75 ? 'Solid. Revisit the sections behind the ones you missed.' :
            'Work back through the sections behind the questions you missed, then try again.');
    } else { endEl.textContent = ''; }
  }

  function buildQuiz() {
    if (!body) return;
    body.innerHTML = ''; answered = 0; correct = 0;
    Q.forEach(function (item, i) {
      var card = document.createElement('div');
      card.className = 'qcard';
      var n = document.createElement('div');
      n.className = 'qn'; n.textContent = 'Question ' + (i + 1) + ' of ' + Q.length;
      var t = document.createElement('div');
      t.className = 'qt'; t.textContent = item.q;
      card.appendChild(n); card.appendChild(t);
      var expl = document.createElement('div');
      expl.className = 'expl'; expl.textContent = item.e;
      item.a.forEach(function (opt, j) {
        var b = document.createElement('button');
        b.className = 'opt'; b.type = 'button'; b.textContent = opt;
        b.addEventListener('click', function () {
          if (card.dataset.done) return;
          card.dataset.done = '1'; answered++;
          var all = card.querySelectorAll('.opt');
          [].slice.call(all).forEach(function (x) { x.disabled = true; });
          all[item.c].classList.add('right');
          if (j === item.c) correct++; else b.classList.add('wrong');
          expl.classList.add('show');
          updateScore();
        });
        card.appendChild(b);
      });
      card.appendChild(expl);
      body.appendChild(card);
    });
    updateScore();
  }
  var rq = document.getElementById('resetQuiz');
  if (rq) rq.addEventListener('click', function () {
    buildQuiz();
    window.scrollTo({ top: 0, behavior: 'smooth' });
  });
  buildQuiz();

  /* ---------- print: show everything ---------- */
  window.addEventListener('beforeprint', function () {
    pages.forEach(function (p) { p.classList.add('on'); });
  });
  window.addEventListener('afterprint', function () {
    var id = (location.hash || '#home').replace('#', '');
    pages.forEach(function (p) { p.classList.toggle('on', p.id === id); });
  });

  spy();
})();
