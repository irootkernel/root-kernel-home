// content.en.js — the English edition's copy (DECISIONS 4-21), read through text.js on the pages under /en/.
// Every fact (address, versions, repositories, slugs, release lines) comes from content.js; this file holds only the
// English text, in content.js's shape. The ~1-minute demos are Korean-only (DEMOS false): their fields (SVC.ex,
// SPEAKER, PROCEDURE, HOMEPAGE_NOTE, gateSubAt and the demo keys of COPY) have no English and are left out.
// Rules (COPY-STYLE.md, "English edition"): the company is Root Kernel and its founder Yeonghun Jeong (Founder & CEO);
// "15+ years"; AI-SPARK is a patent application, never granted; the financial client is only "a Korean
// financial institution"; no solo-company or headcount wording and no numbers to boast; the tools are public on
// GitHub, never "all open source".
import * as KO from './content.js?v=cfd99ce5c804';

export const { MAIL, GITHUB, repoUrl, LOGO, SVC_KEYS, SCENARIO_AREA, SVC_SLUG_REDIRECT, TOOL_ORDER, RELEASES } = KO;
export const DEMOS = false;

const pick = (o, keys) => Object.fromEntries(keys.map((k) => [k, o[k]]));

export const COMPANY = {
  ...KO.COMPANY,
  name: KO.COMPANY.nameEn,
  nameKo: KO.COMPANY.name,
  address: KO.COMPANY.addressEn,
  // the first screen's H1, one entry per line (two lines down to a 390 px phone)
  identityLines: ['We build software', 'with AI under control.'],
  identity: 'Root Kernel builds software with technology that keeps AI under control.',
  principle: 'Tools do the Deterministic work, AI does the work that needs judgment, and people make the important decisions.',
};

export const FOUNDER = {
  ...KO.FOUNDER,
  name: KO.FOUNDER.nameEn,
  nameKo: KO.FOUNDER.name,
  experience: '15+ years in software',
  // one line under the first screen, as the Korean line is (the full profile is on /en/company/)
  line: `${KO.FOUNDER.title} ${KO.FOUNDER.nameEn} · 15+ years in software · M.S. in CS · LG Linux Kernel · SAP HANA`,
};

export const FOUNDER_PROFILE = [
  { k: 'Education', v: 'M.S. in Computer Science, UNIST (Ulsan National Institute of Science and Technology) · CGRA compiler research' },
  { k: 'Papers', v: 'ACM TACO 2013, first author · DATE 2013, co-author · Outstanding Paper Award, Korean Conference on Semiconductors 2014' },
  { k: 'LG Electronics', v: '2013.08–2016.10 · Linux Kernel process scheduler for next-generation mobile SoCs · webOS power management' },
  { k: 'SAP Labs Korea', v: '2016.10–2026.01 · SAP HANA RDBMS core · Tech Lead for cloud DB infrastructure · session recovery after failures' },
  { k: 'Patent', v: 'US 11,663,091 — database session recovery using client-side caching (inventor · family granted in Europe and Japan)' },
  { k: 'Application', v: 'US 2024/0362354 — database tenant lifecycle management (under examination)' },
  { k: 'Certificates', v: 'CKA · CKAD (2022)' },
];

export const CLIENT_LABEL = 'Corporate banking upgrade project at a Korean financial institution (2026.08–12)';
export const AI_SPARK = 'AI-SPARK · Korean patent application (2026.04)';

export const TRACK = [
  ['2026.01', 'Started building Sudal and AI-SPARK'],
  ['2026.02', 'Selected for the Seoul 50 Plus Foundation office support program'],
  ['2026.04', 'Filed a Korean patent application for AI-SPARK'],
  ['2026.06', 'Founded Root Kernel'],
  ['2026.07', 'Ember Quest · selected for the AX support program for game development (round 2)'],
  ['2026.08–12', 'Corporate banking upgrade project at a Korean financial institution'],
];

// The three service areas, in content.js's order. "Product" is the visitor's own product (the site's own products
// above the surface are "Products").
const svc = (k, o) => ({ ...pick(KO.SVC[k], ['no', 'slug', 'scenarios']), ...o });
export const SVC = {
  web: svc('web', {
    area: 'Product', name: 'Web & app development', short: 'Web & app development',
    desc: 'We build B2C and B2B web services and mobile apps that your customers use directly.',
    scope: 'Web services · mobile apps',
  }),
  erp: svc('erp', {
    area: 'Internal systems', name: 'Custom ERP development', short: 'Custom ERP development',
    desc: 'We design workflow systems and ERP around your company’s processes and data, and build the cloud and DB infrastructure under them.',
    scope: 'Workflow systems · ERP',
  }),
  ax: svc('ax', {
    area: 'AI', name: 'AI transformation (AX)', short: 'AI transformation (AX)',
    desc: 'AI Agents for your operations, an AI Harness for your development team.',
    scope: 'AI Agent · AI Harness adoption',
  }),
};

// The sea-creature tools show their English tag here (their Korean names mean stingray, seal, coral, hermit crab and
// dolphin), as the English-only tools always do.
const tool = (id, role) => ({ ...KO.TOOLS[id], ko: '', role });
export const TOOLS = {
  aquarium: tool('aquarium', 'An AI Harness that ties many Tools into one workflow. It changes nothing until the plan is approved.'),
  'aquarium-for-claude': tool('aquarium-for-claude', 'Aquarium as a Claude Code plugin. Every task keeps a tracked state, completion needs verified evidence, and consequential actions wait for a person to approve them.'),
  podway: tool('podway', 'Records the state of work as an FSM procedure with Gates and rework paths. It does not run checks itself.'),
  gaori: tool('gaori', 'Runs test commands, keeps the raw logs and returns the failure evidence. The exit code decides pass or fail.'),
  mulgae: tool('mulgae', 'Hands code review to several AI models. Its findings are advice only, with no authority to approve.'),
  sanho: tool('sanho', 'Keeps the documents of many repositories in sync with one canonical documentation repository.'),
  sorage: tool('sorage', 'A local broker that passes documents and review comments between AI coding sessions.'),
  dolgorae: tool('dolgorae', 'A control layer that gives long-running Codex jobs identity, permissions, recovery and audit records.'),
  dispatch: tool('dispatch', 'Turns changes in a documentation repository into Deterministic plans and receipts, and sends them to AI Agents as work.'),
  atn: tool('atn', 'Keeps track of discussions among AI Agents: their progress and their records.'),
};
export const toolSub = (id) => TOOLS[id].ko || TOOLS[id].tag;
export const toolLabel = (id) => [TOOLS[id].name, toolSub(id)].filter(Boolean).join(' · ');

const prod = (id, o) => ({ ...KO.PRODUCTS.find((p) => p.id === id), ko: '', ...o });
export const PRODUCTS = [
  prod('sudal', {
    line: 'A real-time would-you-rather game that starts conversations',
    note: 'Everyone joins on their own device by QR code or invite link, and can rejoin and keep playing after a brief disconnect.',
    desc: 'Friends, couples and coworkers answer questions together and find things to talk about. Everyone joins on their own device by QR code or invite link, and once everyone has chosen, the results appear for all. After a brief disconnect, players rejoin and keep playing. Live sessions run on the AI-SPARK session runtime: the client only sends events, and the runtime decides every state transition.',
  }),
  prod('doksuri', {
    line: 'Project management where people and AI work together',
    note: 'AI reads and edits the context of Markdown files, and handles the work that has to match the server through a CLI. People approve the important changes.',
    desc: 'A tool for a few people and many AIs working together. Tasks and documents are Markdown files, synced both ways between local files and the server. AI reads and edits the context of those files, and handles the work that has to match the server — search, comments, status checks — through a CLI. Each AI has its own permissions, and people review and approve the important changes.',
  }),
  prod('ember-quest', {
    badge: 'Selected · 2026 AX program',
    line: 'A physics puzzle RPG where embers light the way',
    note: 'It runs on a Deterministic core with a fixed 30Hz tick, so the same commands give the same result on any device.',
    desc: 'A portrait-mode pixel-art puzzle RPG: shoot embers to light up dark mazes. It runs on a Deterministic core with a fixed 30Hz tick, so the same commands on the same stage give the same result on any device, at any time. Replays become records you can run again.',
  }),
];
export const PRODUCTS_HEAD = {
  lines: KO.PRODUCTS_HEAD.lines,
  lede: 'Problems we find in our products move our technology forward, and the improved technology goes back into the products.',
};

export const COPY = {
  ask: 'How can we help?',
  pickOther: 'Have another question?',
  mailHint: 'Please add the details in the mail that opens.',
  companyHook: KO.COPY.companyHook,
  companyLine: 'Root Kernel researches technology that controls the work of AI, and uses it to build software for clients and its own products. Founded in Seoul in June 2026.',
  svcHook: KO.COPY.svcHook,
  contactHook: KO.COPY.contactHook,
  contactLine: 'We take inquiries about AI Harness and AI Agent adoption, software development and technical collaboration. If you have a project you need help with, or a technical problem to work on together, get in touch.',
  svcPage: {
    web: {
      make: 'We build services your customers use every day. We design for mobile first and implement external integrations such as sign-in, notifications and maps.',
      scope: 'Web · Mobile App · Admin · API · external service integration',
      deliver: 'Approved Spec · working service · test records · review changes · source code',
    },
    erp: {
      make: 'Every company has its own approval lines, permissions and existing data, and we design around them. Requesters and approvers get separate screens and permissions.',
      scope: 'HR · attendance · e-approval · inventory · purchasing · accounting integration · Cloud · DB infrastructure',
      deliver: 'Approved Spec · working system · test records · review changes · operations guide',
      basis: 'Our founder developed the SAP HANA core and cloud DB infrastructure at SAP Labs Korea, and is now on a corporate banking upgrade project at a Korean financial institution (2026.08–12).',
    },
    ax: {
      make: 'Our AI Agents work only within a defined scope and hand questions they cannot answer to a person instead of guessing. For development teams, we introduce an AI Harness with Spec, test, review and approval steps, and train the team on a real task.',
      scope: 'AI Agent development · AI Harness adoption · team training',
      deliver: 'Approved Spec · answer-scope document or assessment · test records · training materials · process documents',
    },
  },
  opsNote: 'For all three, we stay on for operation and maintenance after delivery.',
};

export const META = {
  services: 'Root Kernel offers three services',
  openSource: 'Tools Root Kernel builds and uses itself, all public on GitHub. The AI Harness, Aquarium for Codex and Claude Code, covers testing, code review and procedure; the AI Agent tools run, deliberate and dispatch Agents.',
  kernel: 'We do not hand everything to AI. Deterministic work runs as CLI and MCP Tools, and only Non-deterministic work that needs judgment and generation goes to AI/LLMs.',
  products: 'Sudal · Doksuri · Ember Quest. Products Root Kernel builds itself, all in development.',
  contactTitle: 'Contact',
  contact: `Write to ${MAIL} and we will reply once we have read it.`,
};

export const UI = {
  close: 'Close',
  ai: 'Root Kernel AI',
  other: 'Other',
  whens: ['As soon as possible', 'In 1–3 months', 'After 3 months', 'Not sure yet'],
  copied: (mail) => `Email address copied: ${mail}`,
  copyFailed: (mail) => `Could not copy it. Please write to ${mail}.`,
  consult: 'Request a consultation',
  quoteNote: 'We quote cost and schedule once the Spec is settled.',
  contactPage: 'Contact page →',
  toContact: 'Contact us',
  toOpenSource: 'See our tools',
  contactAi: 'Pick a topic and a timing, and a draft opens in your mail app. Nothing is sent until you send it from your mail app. We will reply once we have read it.',
  openDraft: 'Open mail draft',
  noMailApp: 'If your mail app does not open',
  copyMail: 'Copy email address',
  repoLink: (label) => `${label} · open the GitHub repository`,
  more: (name) => `More about ${name}`,
};

export const MAIL_COPY = {
  subjectOf: (tag) => `[Root Kernel ${tag}]`,
  tag: 'inquiry',
  consultTag: 'consultation',
  greet: 'Hello, I am writing from the Root Kernel website.',
  kind: 'Topic',
  when: 'Timing',
  want: '[What I would like to do]',
  contact: '[Contact details]',
  to: 'To',
  subject: 'Subject',
  sendTo: 'Send to',
};
