import { THEMES } from './constants.js';
import {
  applyTheme,
  getActiveTheme,
  getNextTheme,
  getPreferredTheme,
  writeStoredTheme,
} from './helpers.js';

const updateThemeToggleLabel = (button, theme) => {
  button.setAttribute(
    'aria-label',
    theme === THEMES.DARK ? 'Switch to light mode' : 'Switch to dark mode',
  );
};

const bindThemeToggle = () => {
  const button = document.querySelector('.theme-toggle');
  if (!button) {
    return;
  }

  updateThemeToggleLabel(button, getActiveTheme());

  button.addEventListener('click', () => {
    const nextTheme = getNextTheme(getActiveTheme());
    applyTheme(nextTheme);
    writeStoredTheme(nextTheme);
    updateThemeToggleLabel(button, nextTheme);
  });
};

const whenDocumentReady = () => {
  if (document.readyState !== 'loading') {
    return Promise.resolve();
  }

  return new Promise((resolve) => {
    document.addEventListener('DOMContentLoaded', resolve, { once: true });
  });
};

const main = async () => {
  applyTheme(getPreferredTheme());
  await whenDocumentReady();
  bindThemeToggle();
};

main().catch((error) => {
  console.error('Failed to initialize site UI.', error);
});
