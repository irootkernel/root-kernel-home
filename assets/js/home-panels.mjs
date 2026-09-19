import {pageHref} from './locale.mjs?v=c2e532ba3ebb92d1';
import {homeText as koHomeText} from './home-panels.ko.mjs?v=c2e532ba3ebb92d1';
import {homeText as enHomeText} from './home-panels.en.mjs?v=c2e532ba3ebb92d1';

const resources = {ko: koHomeText, en: enHomeText};
const e = text => String(text).replace(/[&<>"']/g, char => ({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[char]));

function assertTranslation(reference, candidate, path) {
  if (Array.isArray(reference)) {
    if (!Array.isArray(candidate) || candidate.length !== reference.length) throw new Error(`Missing translation: ${path}`);
    reference.forEach((value, index) => assertTranslation(value, candidate[index], `${path}.${index}`));
    return;
  }
  if (reference && typeof reference === 'object') {
    if (!candidate || typeof candidate !== 'object') throw new Error(`Missing translation: ${path}`);
    for (const key of Object.keys(reference)) assertTranslation(reference[key], candidate[key], `${path}.${key}`);
    return;
  }
  if (typeof candidate !== 'string' || !candidate) throw new Error(`Missing translation: ${path}`);
}

assertTranslation(resources.ko, resources.en, 'en.homePanels');

function content(locale) {
  const selected = resources[locale];
  if (!selected) throw new Error(`Unsupported panel locale: ${locale}`);
  return selected;
}

export const homePanelTitle = (id, locale = 'ko') => content(locale).titles[id];
const heading = (label, title, lead = '') => `<div class="eyebrow">${label}</div><h2>${title}</h2>${lead ? `<p class="panel-lead">${lead}</p>` : ''}`;
const format = (template, values) => template.replace(/\{(\w+)\}/g, (_, key) => {
  if (!(key in values)) throw new Error(`Missing panel value: ${key}`);
  return String(values[key]);
});

function todo(text, {empty = false, saved = false, stage = 3, testing = false} = {}) {
  const visible = empty ? [] : text.tasks.slice(0, testing && stage === 3 ? 2 : Math.max(1, stage));
  const count = format(text.count, {count: visible.length, taskLabel: visible.length === 1 ? text.taskOne : text.taskMany});
  return `<div class="todo-window"><div class="todo-chrome"><span>○ ○ ○</span><span>${text.chromeTitle}</span><span>${saved ? text.saved : text.working}</span></div><div class="todo-body"><div class="todo-date">TODAY</div><h3>${text.heading}</h3><div class="todo-input"><span>${stage === 0 ? text.inputTask : text.inputPlaceholder}</span><span class="todo-add">＋</span></div><ul class="todo-list">${visible.map((task, i) => `<li class="${i === 0 && stage >= 2 ? 'done' : ''}"><span class="todo-checkbox">${i === 0 && stage >= 2 ? '✓' : ''}</span><span>${task}</span><span class="todo-delete">×</span></li>`).join('')}</ul>${empty ? `<div class="todo-empty">${text.empty}</div>` : ''}<div class="todo-bottom"><span>${count}</span><span>${empty ? text.afterRefresh : saved ? text.savedState : text.filters}</span></div></div></div>`;
}

function reviews(state, text) {
  return `<div class="review-cards">${text.roles.map(([id, label, scope]) => {
    const branch = state.branches.find(item => item.nodeId === id);
    const status = branch?.status || 'running';
    return `<div class="review-card ${status}"><div><span>${status === 'pass' ? '✓' : status === 'fail' ? '×' : '◌'}</span><strong>${label}</strong></div><p>${scope}</p><small>${text.reviewStatuses[status]}</small></div>`;
  }).join('')}</div>`;
}

const checks = (items, done) => `<ul class="todo-checks">${items.map(item => `<li><span>${done ? '✓' : '◌'}</span>${item}</li>`).join('')}</ul>`;

export function renderHomePanel(id, state, stage, products, locale = 'ko') {
  const text = content(locale);
  if (id === 'identity') {
    const copy = text.identity;
    return `<article class="identity">${heading(copy.label, copy.title, copy.lead)}<div class="identity-bottom"><p class="identity-explanation">${copy.explanation}</p><div class="root-symbol" aria-hidden="true"><img src="/assets/rootkernel-symbol.svg" alt=""><span>${copy.symbol}</span></div></div></article>`;
  }
  if (id === 'approach') {
    const copy = text.approach;
    return `<article>${heading(copy.label, copy.title, copy.lead)}<div class="method-columns"><section><span>01</span><h3>AI-SPARK</h3><p>${copy.spark}</p><a href="${pageHref('technology', locale)}#step=tech-spark">${copy.sparkLink}</a></section><section><span>02</span><h3>Podway</h3><p>${copy.podway}</p><a href="https://github.com/irootkernel/podway" target="_blank" rel="noreferrer">${copy.github}</a></section></div></article>`;
  }
  if (id === 'todo-design') {
    const copy = text.todoDesign;
    return `<article class="todo-design">${heading(copy.label, copy.title)}<div class="todo-layout"><div class="todo-state-map" aria-label="${copy.ariaLabel}"><p class="state-entry">${copy.addTask} <span>→ ${copy.inProgress}</span></p><div class="todo-state-row"><div class="todo-state"><small>STATE 01</small><strong>${copy.inProgress}</strong></div><div class="todo-state-arrows"><span>${copy.markComplete}</span><span>${copy.resume}</span></div><div class="todo-state"><small>STATE 02</small><strong>${copy.complete}</strong></div></div><div class="todo-state-delete"><span>${copy.deleteFromStates}</span><b>↓</b><div class="todo-state"><strong>${copy.deleted}</strong><small>${copy.removed}</small></div></div></div><div class="todo-details"><h3>${copy.conditionsHeading}</h3>${checks(copy.conditions, false)}<div class="todo-storage-rule"><span>${copy.storageLabel}</span><p>${copy.storageBody}</p></div></div></div></article>`;
  }
  if (id === 'founder-responsibility') {
    const copy = text.founder;
    return `<article class="founder-responsibility">${heading(copy.label, e(copy.title))}<p class="founder-credential">${e(copy.credential)}</p><p class="panel-lead">${e(copy.description)}</p><ul class="founder-experience">${copy.experience.map(item => `<li>${e(item)}</li>`).join('')}</ul></article>`;
  }
  if (id === 'services') {
    const copy = text.services;
    return `<article class="services-overview">${heading(copy.label, copy.title, e(copy.lead))}<ol class="service-scopes">${copy.scopes.map(([number, label]) => `<li><span>${e(number)}</span><h3>${e(label)}</h3></li>`).join('')}</ol><div class="panel-links"><a href="${pageHref('technology', locale)}">${e(copy.technologyLink)}</a><a href="${pageHref('contact', locale)}">${e(copy.contactLink)}</a></div></article>`;
  }
  if (id === 'products-overview') {
    const copy = text.productsOverview;
    return `<article>${heading(copy.label, copy.title, copy.lead)}<div class="product-overview">${Object.entries(products).map(([key, product]) => `<a href="${pageHref('products', locale)}#step=product-${key}"><img src="/assets/images/${e(product.image)}" alt="${e(product.alt)}" width="1000" height="580"><h3>${e(product.name)} <span>↗</span></h3><p>${e(copy.summaries[key])}</p><strong class="product-status">${e(product.status)}</strong><small>${e(product.caption)}</small></a>`).join('')}</div><a class="text-link products-contact-link" href="${pageHref('contact', locale)}">${e(copy.contactLink)}</a></article>`;
  }

  const revision = state.revision;
  const failed = state.branches.some(branch => branch.status === 'fail');
  const tested = state.nodeStates.test === 'passed';
  const repeat = id.includes('rereview');
  if (id.endsWith('review-start')) {
    const copy = text.review;
    return `<article>${heading(`CODE REVIEW / r${revision}`, repeat ? copy.startRepeatTitle : copy.startTitle, copy.startLead)}${reviews(state, text)}<div class="review-target"><span>${copy.targetLabel}</span><b>ToDo list · ${revision === 1 ? copy.targetFirst : copy.targetRevised}</b></div></article>`;
  }
  if (id.endsWith('review-result')) {
    const copy = text.review;
    return `<article>${heading(`CODE REVIEW / r${revision}`, failed ? copy.failedTitle : repeat ? copy.repeatTitle : copy.pendingTitle)}<div class="review-result-layout">${todo(text.todo, {empty: failed, saved: repeat, stage: 3})}<div>${reviews(state, text)}<p class="result-note">${failed ? copy.failedNote : state.focusNodeId === 'review' ? copy.passedNote : copy.pendingNote}</p></div></div></article>`;
  }

  const fixed = id === 'todo-fix';
  const retest = id === 'todo-retest';
  const test = id === 'todo-test' || retest;
  const copy = text.implementation;
  const title = fixed ? copy.fixedTitle : retest ? copy.retestTitle : test ? copy.testTitle : copy.buildTitle;
  const label = fixed ? copy.fixedLabel : test ? copy.testLabel : copy.buildLabel;
  const detailHeading = fixed ? copy.fixedHeading : test ? copy.testHeading : copy.buildHeading;
  const items = [...copy.checks, ...(test && !retest ? [] : [copy.persistenceCheck])];
  return `<article>${heading(`TODO LIST / ${label}`, title)}<div class="todo-layout">${todo(text.todo, {saved: fixed || retest, stage, testing: test})}<div class="todo-details"><h3>${detailHeading}</h3>${checks(items, test ? tested : fixed && stage >= 2)}${fixed ? `<p class="result-note">${copy.fixedNote}</p>` : test && !retest ? `<p class="result-note">${copy.testNote}</p>` : ''}</div></div></article>`;
}
