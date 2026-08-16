(function () {
  'use strict';

  const navToggle = document.querySelector('.nav-toggle');
  const navLinks = document.querySelector('.nav-links');
  const root = document.documentElement;
  const storageKey = window.themeStorageKey || 'theme';

  function currentTheme() {
    return root.getAttribute('data-theme') === 'light' ? 'light' : 'dark';
  }

  function setTheme(theme, persist) {
    root.setAttribute('data-theme', theme);
    document.querySelectorAll('.theme-toggle').forEach(function (toggle) {
      toggle.setAttribute('aria-pressed', theme === 'dark');
      toggle.setAttribute('aria-label', theme === 'dark' ? 'Switch to light mode' : 'Switch to dark mode');
    });
    if (persist) {
      try {
        localStorage.setItem(storageKey, theme);
      } catch (e) {
        /* Storage unavailable — theme applies for this page only */
      }
    }
  }

  document.addEventListener('click', function (event) {
    var toggle = event.target.closest('.theme-toggle');
    if (!toggle) return;
    setTheme(currentTheme() === 'dark' ? 'light' : 'dark', true);
  });

  setTheme(currentTheme(), false);

  if (navToggle && navLinks) {
    navToggle.addEventListener('click', function () {
      navLinks.classList.toggle('is-open');
      navToggle.setAttribute(
        'aria-expanded',
        navLinks.classList.contains('is-open')
      );
    });

    navLinks.querySelectorAll('a').forEach(function (link) {
      link.addEventListener('click', function () {
        navLinks.classList.remove('is-open');
        navToggle.setAttribute('aria-expanded', 'false');
      });
    });
  }

  function initVideoPlayers() {
    const videoWraps = document.querySelectorAll('.project-video-wrap');

    videoWraps.forEach(function (wrap) {
      const video = wrap.querySelector('video');
      const placeholder = wrap.querySelector('.video-placeholder');
      if (!video) return;

      video.muted = true;
      video.playsInline = true;
      video.loop = true;

      function showPlaceholder() {
        video.style.display = 'none';
        if (placeholder) placeholder.style.display = 'flex';
      }

      function hidePlaceholder() {
        video.style.display = 'block';
        if (placeholder) placeholder.style.display = 'none';
      }

      let retryCount = 0;
      const maxRetries = 3;

      video.addEventListener('error', function () {
        if (retryCount < maxRetries) {
          retryCount += 1;
          setTimeout(function () {
            video.load();
          }, 1000 * retryCount);
        } else {
          showPlaceholder();
        }
      });

      video.addEventListener('loadeddata', function () {
        retryCount = 0;
        hidePlaceholder();
      });

      video.addEventListener('playing', hidePlaceholder);

      if (video.readyState === 0 && !video.currentSrc) {
        showPlaceholder();
      }

      const reduceMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

      function playInView() {
        if (reduceMotion) return;
        video.muted = true;
        video.playsInline = true;
        const attempt = function () {
          video.play().catch(function () {
            wrap.addEventListener(
              'click',
              function () {
                video.play().catch(function () {});
              },
              { once: true }
            );
          });
        };
        if (video.readyState >= 2) {
          attempt();
        } else {
          video.addEventListener('canplay', attempt, { once: true });
          video.load();
        }
      }

      const visibilityObserver = new IntersectionObserver(
        function (entries) {
          entries.forEach(function (entry) {
            if (!video.hasAttribute('data-autoplay')) return;
            if (entry.isIntersecting) {
              playInView();
            } else if (!video.paused) {
              video.pause();
            }
          });
        },
        { threshold: 0.45 }
      );

      visibilityObserver.observe(wrap);
    });
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', initVideoPlayers);
  } else {
    initVideoPlayers();
  }
})();
