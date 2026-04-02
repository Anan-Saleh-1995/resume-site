import { applyTheme, getPreferredTheme } from './helpers.js';

const initiateTheme = () => {
  applyTheme(getPreferredTheme());
};

const main = () => {
  initiateTheme();
};

main();
