import { root, themeMediaQuery, THEMES } from './constants.js';

export const isTheme = (value) =>
  value === THEMES.LIGHT || value === THEMES.DARK;

export const readStoredTheme = () => {
  try {
    const value = window.localStorage.getItem('theme');
    return isTheme(value) ? value : null;
  } catch {
    return null;
  }
};

export const writeStoredTheme = (theme) => {
  try {
    window.localStorage.setItem('theme', theme);
  } catch {
    // Ignore storage failures so the toggle still works for the session.
  }
};

export const getSystemTheme = () =>
  themeMediaQuery.matches ? THEMES.DARK : THEMES.LIGHT;

export const getPreferredTheme = () => readStoredTheme() || getSystemTheme();

export const getActiveTheme = () =>
  isTheme(root.dataset.theme) ? root.dataset.theme : getPreferredTheme();

export const applyTheme = (theme) => {
  root.dataset.theme = theme;
};

export const getNextTheme = (theme) =>
  theme === THEMES.DARK ? THEMES.LIGHT : THEMES.DARK;
