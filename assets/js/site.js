(() => {
  const root = document.documentElement;
  const storedTheme = localStorage.getItem('theme');

  if (storedTheme === 'light' || storedTheme === 'dark') {
    root.dataset.theme = storedTheme;
  }

  const bindThemeToggle = () => {
    const button = document.querySelector('.theme-toggle');
    if (!button) return;

    const getTheme = () => root.dataset.theme || 'system';

    const updateLabel = () => {
      const theme = getTheme();
      button.setAttribute(
        'aria-label',
        theme === 'dark' ? 'Switch to light mode' : 'Switch to dark mode',
      );
    };

    button.addEventListener('click', () => {
      const current = getTheme();
      const next = current === 'dark' ? 'light' : 'dark';

      root.dataset.theme = next;
      localStorage.setItem('theme', next);
      updateLabel();
    });

    updateLabel();
  };

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', bindThemeToggle, {
      once: true,
    });
  } else {
    bindThemeToggle();
  }
})();
