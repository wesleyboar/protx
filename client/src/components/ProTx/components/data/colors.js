/* derived from https://colorbrewer2.org/#type=sequential&scheme=YlOrRd&n=6 */
const colorbrewerClassYlOrBr = {
  6: ['#ffffd4', '#fee391', '#fec44f', '#fe9929', '#d95f0e', '#993404'],
  5: ['#ffffd4', '#fed98e', '#fe9929', '#d95f0e', '#993404'],
  4: ['#ffffd4', '#fed98e', '#fe9929', '#cc4c02'],
  3: ['#fff7bc', '#fec44f', '#d95f0e'],
  2: ['#fff7bc', '#fec44f'],
  1: ['#fff7bc']
};

/* derived from https://jira.tacc.utexas.edu/secure/attachment/15628/Cook_Childrens_Guide_Abbreviated%201-14-22.pdf */
const cooksBrandingNarrowGradient = {
  6: ['#EAF6C7', '#D4EC8E', '#A9C47F', '#007A53', '#003B5C', '#001E2E'],
  5: ['#EAF6C7', '#D4EC8E', '#A9C47F', '#007A53', '#003B5C'],
  4: ['#D4EC8E', '#A9C47F', '#007A53', '#003B5C'],
  3: ['#A9C47F', '#007A53', '#003B5C'],
  2: ['#007A53', '#003B5C'],
  1: ['#007A53']
};
const cooksBrandingWideLightnessGradient = {
  9: ['#001E2E', '#003B5C', '#545859', '#007A53', '#41748D', '#A9C47F', '#B9D3DC', '#D4EC8E', '#EAF6C7'],
  8: ['#003B5C', '#545859', '#007A53', '#41748D', '#A9C47F', '#B9D3DC', '#D4EC8E', '#EAF6C7'],
  7: ['#003B5C', '#545859', '#007A53', '#41748D', '#A9C47F', '#B9D3DC', '#D4EC8E'],
  6: ['#003B5C', '#545859', '#007A53', '#41748D', '#B9D3DC', '#A9C47F'],
  5: ['#003B5C', '#545859', '#007A53', '#41748D', '#A9C47F'],
  4: ['#003B5C', '#007A53', '#41748D', '#A9C47F'],
  3: ['#003B5C', '#007A53', '#A9C47F'],
  2: ['#003B5C', '#007A53'],
  1: ['#007A53'],
};
const cooksBrandingWideHueGradient = {
  9: ['#545859', '#41748D', '#B9D3DC', '#EAF6C7', '#D4EC8E', '#A9C47F', '#007A53', '#003B5C', '#001E2E'],
  8: ['#545859', '#41748D', '#B9D3DC', '#D4EC8E', '#A9C47F', '#007A53', '#003B5C', '#001E2E'],
  7: ['#545859', '#41748D', '#B9D3DC', '#D4EC8E', '#A9C47F', '#007A53', '#003B5C'],
  6: ['#545859', '#41748D', '#B9D3DC', '#A9C47F', '#007A53', '#003B5C'],
  5: ['#41748D', '#B9D3DC', '#A9C47F', '#007A53', '#003B5C'],
  4: ['#B9D3DC', '#A9C47F', '#007A53', '#003B5C'],
  3: ['#A9C47F', '#007A53', '#003B5C'],
  2: ['#007A53', '#003B5C'],
  1: ['#007A53'],
};

/* undocumented */
const THEME_CB12_MAIN = [
  '#4363d8',
  '#911eb4',
  '#bcf60c',
  '#fabebe',
  '#808000',
  '#000075',
  '#808080',
  '#ffe119',
  '#e6beff',
  '#3cb44b',
  '#aaffc3',
  '#ffd8b1'
];

const THEME_CB12_ALT0 = [
  '#9F0162',
  '#009F81',
  '#FF5AAF',
  '#00FCCF',
  '#8400CD',
  '#008DF9',
  '#00C2F9',
  '#FFB2FD',
  '#A40122',
  '#E20134',
  '#FF6E3A',
  '#FFC33B'
];

const THEME_CB12_ALT1 = [
  '#006A5E',
  '#ED0D88',
  '#00BDA9',
  '#FFC4D4',
  '#0058CC',
  '#D208FB',
  '#FF66FD',
  '#00EFF9',
  '#156D03',
  '#009719',
  '#00C61B',
  '#00FB1D'
];

const THEME_CB12_ALT2 = [
  '#9F0162',
  '#ED0D88',
  '#FF5AAF',
  '#FFC4D4',
  '#8400CD',
  '#D208FB',
  '#00C2F9',
  '#00EFF9',
  '#A40122',
  '#009719',
  '#FF6E3A',
  '#00FB1D'
];

const THEME_CB12_ALT3 = [
  '#006A5E',
  '#009F81',
  '#00BDA9',
  '#00FCCF',
  '#0058CC',
  '#008DF9',
  '#FF66FD',
  '#FFB2FD',
  '#156D03',
  '#E20134',
  '#00C61B',
  '#FFC33B'
];

// https://colordesigner.io/gradient-generator

const THEME_HIST_GRADIENT_MAIN = [
  '#0c5a77',
  '#006582',
  '#007089',
  '#007b8a',
  '#008586',
  '#008f7d',
  '#00996f',
  '#00a15c',
  '#00a944',
  '#40af23'
];

const THEME_HIST_GRADIENT_ALT0 = [
  '#3e558a',
  '#195f93',
  '#006898',
  '#007199',
  '#007894',
  '#007f8b',
  '#00857e',
  '#008b6f',
  '#138f5e',
  '#46924d'
];

const THEME_HIST_GRADIENT_ALT1 = [
  '#37848e',
  '#2a817d',
  '#2e7d68',
  '#3b7751',
  '#4b703a',
  '#5b6825',
  '#6b5d14',
  '#7a500e',
  '#874116',
  '#902e25'
];

export {
  colorbrewerClassYlOrBr,
  cooksBrandingNarrowGradient,
  THEME_CB12_MAIN,
  THEME_CB12_ALT0,
  THEME_CB12_ALT1,
  THEME_CB12_ALT2,
  THEME_CB12_ALT3,
  THEME_HIST_GRADIENT_MAIN,
  THEME_HIST_GRADIENT_ALT0,
  THEME_HIST_GRADIENT_ALT1
};
