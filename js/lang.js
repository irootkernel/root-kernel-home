// lang.js — the page's language (DECISIONS 4-21): Korean at /, English under /en/ (index.en.html says <html lang="en">).
// No imports: the copy facade (text.js), the router and the build read it. Node (the build, the release tests) has no
// document, so it is Korean unless a test stands one in.
export const LANG = globalThis.document?.documentElement?.lang === 'en' ? 'en' : 'ko';
export const BASE = LANG === 'en' ? '/en' : '';
// a site path ('/company/') in this page's language ('/en/company/' on an English page)
export const href = (p) => BASE + p;
// the same path in the other language: '/company/' ↔ '/en/company/', '/' ↔ '/en/'
export const counterpart = (path) => (path === '/en' || path.startsWith('/en/') ? path.slice(3) || '/' : `/en${path}`);
