(function () {
  'use strict';

  var cards = Array.prototype.slice.call(document.querySelectorAll('.proj'));
  var halls = Array.prototype.slice.call(document.querySelectorAll('[data-hall]'));
  var input = document.getElementById('q');
  var clearBtn = document.getElementById('clear');
  var countEl = document.getElementById('count');
  var totalStat = document.getElementById('stat-total');

  cards.forEach(function (card) {
    card.dataset.text = card.textContent.replace(/\s+/g, ' ').toLowerCase();
  });

  halls.forEach(function (hall) {
    var n = hall.querySelectorAll('.proj').length;
    var badge = hall.querySelector('[data-count]');
    if (badge) badge.textContent = n + ' 条';
    hall.dataset.total = String(n);
  });

  if (totalStat) totalStat.textContent = String(cards.length);

  function defaultCountText() {
    return '共 ' + cards.length + ' 条记录，可按产品名、团队或关键词筛选。';
  }

  function applyFilter() {
    var q = input.value.trim().toLowerCase();
    var matches = 0;

    cards.forEach(function (card) {
      var hit = !q || card.dataset.text.indexOf(q) !== -1;
      card.hidden = !hit;
      if (hit) matches += 1;
    });

    halls.forEach(function (hall) {
      var hit = hall.querySelectorAll('.proj:not([hidden])').length;
      hall.hidden = q ? hit === 0 : false;
      var empty = hall.querySelector('.empty');
      if (empty) empty.hidden = !q || hit !== 0;
    });

    clearBtn.hidden = q === '';
    if (!q) {
      countEl.textContent = defaultCountText();
    } else if (matches === 0) {
      countEl.textContent = '没有匹配「' + input.value.trim() + '」的记录。';
    } else {
      countEl.textContent = '匹配 ' + matches + ' 条。';
    }
  }

  input.addEventListener('input', applyFilter);
  clearBtn.addEventListener('click', function () {
    input.value = '';
    applyFilter();
    input.focus();
  });
  input.addEventListener('keydown', function (e) {
    if (e.key === 'Escape') {
      input.value = '';
      applyFilter();
      input.blur();
    }
  });

  document.addEventListener('keydown', function (e) {
    if (e.key !== '/' || e.metaKey || e.ctrlKey || e.altKey) return;
    var tag = document.activeElement && document.activeElement.tagName;
    if (tag === 'INPUT' || tag === 'TEXTAREA') return;
    e.preventDefault();
    input.focus();
    input.scrollIntoView({ block: 'center' });
  });

  countEl.textContent = defaultCountText();

  var links = Array.prototype.slice.call(document.querySelectorAll('.bar__nav a'));
  var targets = links.map(function (a) {
    return document.querySelector(a.getAttribute('href'));
  }).filter(Boolean);

  function setActive(id) {
    links.forEach(function (a) {
      a.classList.toggle('is-active', a.getAttribute('href') === '#' + id);
    });
  }

  if ('IntersectionObserver' in window) {
    var visible = new Map();
    var io = new IntersectionObserver(function (entries) {
      entries.forEach(function (entry) {
        visible.set(entry.target.id, entry.isIntersecting ? entry.intersectionRatio : 0);
      });
      var best = '';
      var bestRatio = 0;
      visible.forEach(function (ratio, id) {
        if (ratio > bestRatio) { bestRatio = ratio; best = id; }
      });
      if (best) setActive(best);
    }, { rootMargin: '-45% 0px -45% 0px', threshold: [0, 0.01, 0.2, 0.5, 1] });
    targets.forEach(function (t) { io.observe(t); });
  }

  var progress = document.getElementById('progress');
  var ticking = false;

  function updateProgress() {
    var doc = document.documentElement;
    var max = doc.scrollHeight - window.innerHeight;
    var pct = max > 0 ? Math.min(1, Math.max(0, window.scrollY / max)) : 0;
    progress.style.width = (pct * 100).toFixed(2) + '%';
    ticking = false;
  }

  window.addEventListener('scroll', function () {
    if (!ticking) {
      window.requestAnimationFrame(updateProgress);
      ticking = true;
    }
  }, { passive: true });

  window.addEventListener('resize', updateProgress);
  updateProgress();
})();
