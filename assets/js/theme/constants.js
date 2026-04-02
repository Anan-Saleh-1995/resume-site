export const root = document.documentElement;
export const themeMediaQuery = window.matchMedia(
  '(prefers-color-scheme: dark)',
);
export const THEMES = Object.freeze({
  LIGHT: 'light',
  DARK: 'dark',
});
