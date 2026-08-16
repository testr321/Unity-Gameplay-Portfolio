(function () {
  'use strict';

  var storageKey = 'theme';
  window.themeStorageKey = storageKey;

  function resolveTheme() {
    var stored = null;
    try {
      stored = localStorage.getItem(storageKey);
      if (stored !== null && stored !== 'dark' && stored !== 'light') {
        localStorage.removeItem(storageKey);
        stored = null;
      }
    } catch (e) {
      stored = null;
    }
    if (stored === 'dark' || stored === 'light') return stored;
    return 'dark';
  }

  document.documentElement.setAttribute('data-theme', resolveTheme());
})();
