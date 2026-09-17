import {pageHref} from './locale.mjs?v=30652883d5c2fd2f';
import {
  technologyText as koTechnologyText,
  productConversationText as koProductConversationText,
  productText as koProductText,
  sharedText as koSharedText,
} from './topic-content.ko.mjs?v=30652883d5c2fd2f';
import {
  technologyText as enTechnologyText,
  productConversationText as enProductConversationText,
  productText as enProductText,
  sharedText as enSharedText,
} from './topic-content.en.mjs?v=30652883d5c2fd2f';

const resources = {
  ko: {technology: koTechnologyText, productConversation: koProductConversationText, products: koProductText, shared: koSharedText},
  en: {technology: enTechnologyText, productConversation: enProductConversationText, products: enProductText, shared: enSharedText},
};

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

for (const name of ['technology', 'productConversation', 'products', 'shared']) {
  assertTranslation(resources.ko[name], resources.en[name], `en.${name}`);
}

function content(locale) {
  const selected = resources[locale];
  if (!selected) throw new Error(`Unsupported content locale: ${locale}`);
  return selected;
}

const technologyOrder = ['spark', 'podway', 'aquarium', 'dolgorae', 'checks', 'documents', 'atn', 'dispatch'];
const productConversationOrder = ['doksuri', 'sudal', 'ember'];
const productMeta = {
  sudal: {name: 'Sudal', number: '02', category: 'PEOPLE / CONVERSATION', image: 'sudal-usage.jpg'},
  doksuri: {name: 'Doksuri', number: '01', category: 'PEOPLE / AI COLLABORATION', image: 'doksuri-collaboration.png'},
  ember: {name: 'Ember Quest', number: '03', category: 'PLAY / PUZZLE', image: 'ember-quest-prototype.png'},
};

const link = (label, slug, github) => `<div class="source-links"><a href="https://github.com/irootkernel/${slug}" target="_blank" rel="noreferrer">${label} ${github}</a></div>`;
const block = (name, text, slug, github) => `<section><h3>${name}</h3><p>${text}</p>${link(name, slug, github)}</section>`;
const flow = items => `<div class="topic-flow">${items.map((item, index) => `${index ? '<i>→</i>' : ''}<span>${item}</span>`).join('')}</div>`;

function renderTechnologyBody(id, text, locale, github) {
  if (id === 'spark') {
    const href = locale === 'ko' ? 'https://home.rootkernel.xyz/ko/control/' : 'https://home.rootkernel.xyz/en/control/';
    return `<div class="spec-bundle">${text.bundle.map(item => `<span>${item}</span>`).join('')}</div>${flow(text.flow)}<p class="topic-explanation">${text.explanation}</p><div class="source-links"><a href="${href}" target="_blank" rel="noreferrer">${text.sourceLabel}</a></div>`;
  }
  if (id === 'podway') return `${flow(text.flow)}<div class="topic-return">${text.returnText}</div><p class="topic-explanation">${text.explanation}</p>${link('Podway', 'podway', github)}<a class="text-link" href="${pageHref('home', locale)}#step=todo-fix">${text.homeLink}</a>`;
  if (id === 'aquarium') {
    const tools = ['Podway', 'Dolgorae', 'Gaori', 'Mulgae', 'Sanho', 'Sorage'];
    const toolFamily = tools.map((name, index) => `<span>${name}<small>${text.toolRoles[index]}</small></span>`).join('');
    const editionLinks = [['Claude Code', 'aquarium-for-claude'], ['GLM', 'aquarium-for-glm'], ['Grok', 'aquarium-for-grok']]
      .map(([name, slug]) => link(name, slug, github)).join('');
    return `<div class="tool-family"><strong>Aquarium</strong><div>${toolFamily}</div></div>${link('Aquarium', 'aquarium', github)}<div class="edition-links">${editionLinks}</div>`;
  }
  if (id === 'dolgorae') return `<div class="agent-team">${text.roles.map(([role, scope]) => `<span>${role}<small>${scope}</small></span>`).join('')}</div><p class="topic-explanation">${text.explanation}</p>${link('Dolgorae', 'dolgorae', github)}`;
  if (id === 'checks') return `<div class="topic-columns">${block('Gaori', text.gaori, 'gaori', github)}${block('Mulgae', text.mulgae, 'mulgae', github)}</div>`;
  if (id === 'documents') return `<div class="topic-columns">${block('Sanho', text.sanho, 'sanho', github)}${block('Sorage', text.sorage, 'sorage', github)}</div>`;
  if (id === 'atn') return `${flow(text.flow)}<div class="topic-columns">${block('ATN Control', text.control, 'agent-turn-network-control', github)}${block('ATN Plugin', text.plugin, 'agent-turn-network-plugin', github)}</div>`;
  if (id === 'dispatch') return `${flow(text.flow)}<div class="topic-columns">${block('Agent Dispatch', text.core, 'agent-dispatch', github)}${block('Agent Dispatch Plugin', text.plugin, 'agent-dispatch-plugin', github)}</div>`;
  throw new Error(`Missing technology template: ${id}`);
}

export function getTechnologyContent(locale = 'ko') {
  const selected = content(locale);
  return technologyOrder.map(id => {
    const text = selected.technology[id];
    return {...text, id, body: renderTechnologyBody(id, text, locale, selected.shared.github)};
  });
}

export function getProductConversation(locale = 'ko') {
  const selected = content(locale).productConversation;
  return productConversationOrder.map(id => ({id, ...selected[id]}));
}

export function getProductData(locale = 'ko') {
  const selected = content(locale).products;
  return Object.fromEntries(Object.entries(productMeta).map(([id, meta]) => [id, {...meta, ...selected[id]}]));
}

export const technologyContent = getTechnologyContent('ko');
export const productConversation = getProductConversation('ko');
export const productData = getProductData('ko');
