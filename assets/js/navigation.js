// Java Refresher — interactive course app behaviour
(function () {
  'use strict';

  var STORAGE_KEY = 'javaRefresherCompletedLessons';

  function getCompleted() {
    try {
      var raw = localStorage.getItem(STORAGE_KEY);
      var parsed = raw ? JSON.parse(raw) : [];
      if (!Array.isArray(parsed)) return [];
      return parsed.filter(function (slug) { return typeof slug === 'string' && slug.length > 0; });
    } catch (e) {
      return [];
    }
  }

  function setCompleted(list) {
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(list));
    } catch (e) { /* localStorage unavailable — degrade silently */ }
  }

  function getValidLessonSlugs() {
    var slugs = [];
    document.querySelectorAll('.sidebar-lesson[data-lesson]').forEach(function (link) {
      var slug = link.getAttribute('data-lesson');
      if (slug && slugs.indexOf(slug) === -1) slugs.push(slug);
    });
    return slugs;
  }

  function updateProgressUI() {
    var shell = document.querySelector('.app-shell');
    if (!shell) return;
    var total = parseInt(shell.getAttribute('data-total-lessons'), 10) || 0;
    var storedCompleted = getCompleted();
    var validSlugs = getValidLessonSlugs();

    // Drop stale/deleted lesson ids and duplicates so corrupted or outdated
    // localStorage data can never inflate the percentage above what the
    // current course actually contains.
    var completed = validSlugs.filter(function (slug) {
      return storedCompleted.indexOf(slug) !== -1;
    });
    if (completed.length !== storedCompleted.length) {
      setCompleted(completed);
    }

    var fill = document.getElementById('sidebarProgressFill');
    var percentLabel = document.getElementById('sidebarProgressPercent');
    var bar = document.getElementById('sidebarProgressBar');
    var percent = total > 0 ? Math.round((completed.length / total) * 100) : 0;
    percent = Math.max(0, Math.min(100, percent));

    if (fill) fill.style.width = percent + '%';
    if (percentLabel) percentLabel.textContent = percent + '%';
    if (bar) bar.setAttribute('aria-valuenow', String(percent));

    document.querySelectorAll('.sidebar-lesson[data-lesson]').forEach(function (link) {
      var slug = link.getAttribute('data-lesson');
      link.classList.toggle('is-completed', completed.indexOf(slug) !== -1);
    });

    var markBtn = document.getElementById('markCompleteBtn');
    if (markBtn) {
      var slug = markBtn.getAttribute('data-lesson');
      var isDone = slug && completed.indexOf(slug) !== -1;
      markBtn.classList.toggle('is-complete', !!isDone);
      markBtn.setAttribute('aria-pressed', isDone ? 'true' : 'false');
      var text = markBtn.querySelector('.mark-complete-text');
      if (text) text.textContent = isDone ? 'Completed' : 'Mark as complete';
    }
  }

  function initMarkComplete() {
    var markBtn = document.getElementById('markCompleteBtn');
    if (!markBtn) return;
    var slug = markBtn.getAttribute('data-lesson');
    if (!slug) return;

    markBtn.addEventListener('click', function () {
      var completed = getCompleted();
      var idx = completed.indexOf(slug);
      if (idx === -1) {
        completed.push(slug);
      } else {
        completed.splice(idx, 1);
      }
      setCompleted(completed);
      updateProgressUI();
    });
  }

  function initMobileDrawer() {
    var shell = document.querySelector('.app-shell');
    var toggle = document.getElementById('sidebarToggle');
    var overlay = document.getElementById('sidebarOverlay');
    var sidebar = document.getElementById('courseSidebar');
    if (!shell || !toggle || !overlay || !sidebar) return;

    function openDrawer() {
      shell.classList.add('sidebar-open');
      toggle.setAttribute('aria-expanded', 'true');
      overlay.removeAttribute('tabindex');
      var firstLink = sidebar.querySelector('a, summary');
      if (firstLink) firstLink.focus();
    }

    function closeDrawer(returnFocus) {
      shell.classList.remove('sidebar-open');
      toggle.setAttribute('aria-expanded', 'false');
      overlay.setAttribute('tabindex', '-1');
      if (returnFocus) toggle.focus();
    }

    toggle.addEventListener('click', function () {
      if (shell.classList.contains('sidebar-open')) {
        closeDrawer(true);
      } else {
        openDrawer();
      }
    });

    overlay.addEventListener('click', function () { closeDrawer(true); });

    document.addEventListener('keydown', function (event) {
      if (event.key === 'Escape' && shell.classList.contains('sidebar-open')) {
        closeDrawer(true);
      }
    });

    sidebar.querySelectorAll('a.sidebar-lesson').forEach(function (link) {
      link.addEventListener('click', function () {
        if (window.matchMedia('(max-width: 960px)').matches) {
          closeDrawer(false);
        }
      });
    });
  }

  function initQuizzes() {
    document.querySelectorAll('.quiz-card').forEach(function (card) {
      var raw = card.getAttribute('data-quiz');
      var questions;
      try {
        questions = JSON.parse(raw);
      } catch (e) {
        return;
      }
      if (!Array.isArray(questions) || questions.length === 0) return;

      var startBtn = document.getElementById('quizStartBtn');
      var body = document.getElementById('quizBody');
      var intro = document.getElementById('quizIntro');
      if (!body) return;

      var state = { index: 0, score: 0, selected: null, answered: false };

      function renderQuestion() {
        var q = questions[state.index];
        state.selected = null;
        state.answered = false;

        var optionsHtml = q.options.map(function (opt, i) {
          return '<li>' +
            '<button type="button" class="quiz-option" data-index="' + i + '">' +
            '<span class="quiz-option-bullet" aria-hidden="true"></span>' +
            '<span>' + opt + '</span>' +
            '</button></li>';
        }).join('');

        body.innerHTML =
          '<p class="quiz-progress">Question ' + (state.index + 1) + ' of ' + questions.length + '</p>' +
          '<p class="quiz-question">' + q.question + '</p>' +
          '<ul class="quiz-options" role="listbox">' + optionsHtml + '</ul>' +
          '<div class="quiz-actions">' +
          '<span class="quiz-feedback" id="quizFeedback" aria-live="polite"></span>' +
          '<button type="button" class="btn" id="quizActionBtn" disabled>Check Answer</button>' +
          '</div>';

        var optionButtons = body.querySelectorAll('.quiz-option');
        var actionBtn = document.getElementById('quizActionBtn');
        var feedback = document.getElementById('quizFeedback');

        optionButtons.forEach(function (btn) {
          btn.addEventListener('click', function () {
            if (state.answered) return;
            optionButtons.forEach(function (b) { b.classList.remove('selected'); });
            btn.classList.add('selected');
            state.selected = parseInt(btn.getAttribute('data-index'), 10);
            actionBtn.disabled = false;
          });
        });

        actionBtn.addEventListener('click', function () {
          if (!state.answered) {
            if (state.selected === null) return;
            state.answered = true;
            var isCorrect = state.selected === q.answer;
            if (isCorrect) state.score++;

            optionButtons.forEach(function (btn) {
              var i = parseInt(btn.getAttribute('data-index'), 10);
              btn.disabled = true;
              if (i === q.answer) btn.classList.add('correct');
              else if (i === state.selected) btn.classList.add('incorrect');
            });

            feedback.textContent = isCorrect ? 'Correct!' : 'Not quite.';
            feedback.className = 'quiz-feedback ' + (isCorrect ? 'correct' : 'incorrect');
            actionBtn.textContent = (state.index < questions.length - 1) ? 'Next Question' : 'See Results';
          } else {
            state.index++;
            if (state.index < questions.length) {
              renderQuestion();
            } else {
              renderResults();
            }
          }
        });
      }

      function renderResults() {
        var pct = Math.round((state.score / questions.length) * 100);
        body.innerHTML =
          '<div class="quiz-result">' +
          '<div class="quiz-result-score">' + state.score + ' / ' + questions.length + '</div>' +
          '<p class="quiz-result-copy">You scored ' + pct + '% on this lesson\'s quiz.</p>' +
          '<button type="button" class="btn btn-secondary" id="quizRetakeBtn">Retake Quiz</button>' +
          '</div>';
        document.getElementById('quizRetakeBtn').addEventListener('click', function () {
          state.index = 0;
          state.score = 0;
          renderQuestion();
        });
      }

      if (startBtn) {
        startBtn.addEventListener('click', function () {
          if (intro) intro.hidden = true;
          body.hidden = false;
          renderQuestion();
          body.setAttribute('tabindex', '-1');
          body.focus();
        });
      }
    });
  }

  function initCodeCopyButtons() {
    document.querySelectorAll('pre').forEach(function (block) {
      if (block.querySelector('.code-copy-btn')) return;
      var copyBtn = document.createElement('button');
      copyBtn.type = 'button';
      copyBtn.className = 'code-copy-btn';
      copyBtn.textContent = 'Copy';
      copyBtn.setAttribute('aria-label', 'Copy code');

      block.style.position = 'relative';
      block.appendChild(copyBtn);

      copyBtn.addEventListener('click', function () {
        var code = block.textContent.replace(/Copy$/, '').trim();
        navigator.clipboard.writeText(code).then(function () {
          var originalText = copyBtn.textContent;
          copyBtn.textContent = 'Copied!';
          setTimeout(function () { copyBtn.textContent = originalText; }, 2000);
        });
      });
    });
  }

  function initChecklists() {
    document.querySelectorAll('.checklist[data-checklist-id]').forEach(function (list) {
      var storageKey = 'javaRefresherChecklist:' + list.getAttribute('data-checklist-id');
      var checked = [];
      try {
        var raw = localStorage.getItem(storageKey);
        var parsed = raw ? JSON.parse(raw) : [];
        if (Array.isArray(parsed)) checked = parsed;
      } catch (e) { checked = []; }

      function save() {
        try { localStorage.setItem(storageKey, JSON.stringify(checked)); } catch (e) { /* ignore */ }
      }

      list.querySelectorAll('input[type="checkbox"][data-check-id]').forEach(function (box) {
        var id = box.getAttribute('data-check-id');
        var isChecked = checked.indexOf(id) !== -1;
        box.checked = isChecked;
        box.closest('li').classList.toggle('is-checked', isChecked);

        box.addEventListener('change', function () {
          var idx = checked.indexOf(id);
          if (box.checked && idx === -1) {
            checked.push(id);
          } else if (!box.checked && idx !== -1) {
            checked.splice(idx, 1);
          }
          box.closest('li').classList.toggle('is-checked', box.checked);
          save();
        });
      });
    });
  }

  function initSmoothAnchors() {
    document.querySelectorAll('a[href^="#"]').forEach(function (anchor) {
      anchor.addEventListener('click', function (e) {
        var href = this.getAttribute('href');
        if (href !== '#') {
          var target = document.querySelector(href);
          if (target) {
            e.preventDefault();
            target.scrollIntoView({ behavior: 'smooth', block: 'start' });
          }
        }
      });
    });
  }

  document.addEventListener('DOMContentLoaded', function () {
    initMobileDrawer();
    initMarkComplete();
    updateProgressUI();
    initQuizzes();
    initChecklists();
    initCodeCopyButtons();
    initSmoothAnchors();
  });
})();
