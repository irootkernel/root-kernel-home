// text.js — the copy and facts in this page's language: content.js (Korean) or content.en.js (English, which takes its
// facts from content.js). Korean pages never download the English table; index.en.html preloads it. The modules that
// only run on Korean pages (the ~1-minute demos: journey/, studio/, scenarios/, log.js) import content.js directly.
import * as KO from './content.js?v=cfd99ce5c804';
import { LANG } from './lang.js?v=cfd99ce5c804';

const T = LANG === 'en' ? await import('./content.en.js?v=cfd99ce5c804') : KO;
export const {
  MAIL, GITHUB, repoUrl, LOGO, COMPANY, FOUNDER, FOUNDER_PROFILE, CLIENT_LABEL, AI_SPARK, TRACK,
  SVC_KEYS, SVC, SCENARIO_AREA, SVC_SLUG_REDIRECT, TOOLS, TOOL_ORDER, toolSub, toolLabel, RELEASES,
  PRODUCTS, PRODUCTS_HEAD, COPY, META, UI, MAIL_COPY, DEMOS,
} = T;
