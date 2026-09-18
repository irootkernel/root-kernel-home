import {pageHref} from './locale.mjs?v=fe5964d6adc705a5';
import {
  technologyText as koTechnologyText,
  productConversationText as koProductConversationText,
  productText as koProductText,
  sharedText as koSharedText,
} from './topic-content.ko.mjs?v=fe5964d6adc705a5';
import {
  technologyText as enTechnologyText,
  productConversationText as enProductConversationText,
  productText as enProductText,
  sharedText as enSharedText,
} from './topic-content.en.mjs?v=fe5964d6adc705a5';

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
  sudal: {name: 'Sudal', number: '02', category: 'PEOPLE / CONVERSATION', image: 'sudal-usage.jpg', status: 'IN DEVELOPMENT · CONCEPT PREVIEW'},
  doksuri: {name: 'Doksuri', number: '01', category: 'PEOPLE / AI COLLABORATION', image: 'doksuri-collaboration.png', status: 'IN DEVELOPMENT · CONCEPT PREVIEW'},
  ember: {name: 'Ember Quest', number: '03', category: 'PLAY / PUZZLE', image: 'ember-quest-prototype.png', status: 'IN DEVELOPMENT · CONCEPT PREVIEW'},
};

export const repositoryManifest = Object.freeze({
  aquarium: {label: 'Aquarium', href: 'https://github.com/irootkernel/aquarium'},
  aquariumClaude: {label: 'Aquarium for Claude Code', href: 'https://github.com/irootkernel/aquarium-for-claude'},
  aquariumGlm: {label: 'Aquarium for GLM', href: 'https://github.com/irootkernel/aquarium-for-glm'},
  aquariumGrok: {label: 'Aquarium for Grok', href: 'https://github.com/irootkernel/aquarium-for-grok'},
  podway: {label: 'Podway', href: 'https://github.com/irootkernel/podway'},
  dolgorae: {label: 'Dolgorae', href: 'https://github.com/irootkernel/dolgorae'},
  gaori: {label: 'Gaori', href: 'https://github.com/irootkernel/gaori'},
  mulgae: {label: 'Mulgae', href: 'https://github.com/irootkernel/mulgae'},
  sanho: {label: 'Sanho', href: 'https://github.com/irootkernel/sanho'},
  sorage: {label: 'Sorage', href: 'https://github.com/irootkernel/sorage'},
  atnControl: {label: 'ATN Control', href: 'https://github.com/irootkernel/agent-turn-network-control'},
  atnPlugin: {label: 'ATN Plugin', href: 'https://github.com/irootkernel/agent-turn-network-plugin'},
  agentDispatch: {label: 'Agent Dispatch', href: 'https://github.com/irootkernel/agent-dispatch'},
  agentDispatchPlugin: {label: 'Agent Dispatch Plugin', href: 'https://github.com/irootkernel/agent-dispatch-plugin'},
});

const escapeHtml = text => String(text).replace(/[&<>"']/g, char => ({'&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;'}[char]));
const repositoryAnchor = (id, github) => {
  const repository = repositoryManifest[id];
  if (!repository) throw new Error(`Missing repository: ${id}`);
  return `<a href="${escapeHtml(repository.href)}" target="_blank" rel="noreferrer" aria-label="${escapeHtml(`${repository.label} GitHub`)}">${escapeHtml(repository.label)} ${escapeHtml(github)}</a>`;
};
const repositoryLink = (id, github) => `<div class="source-links">${repositoryAnchor(id, github)}</div>`;
const block = (name, text, repository, github) => `<section><h3>${escapeHtml(name)}</h3><p>${escapeHtml(text)}</p>${repositoryLink(repository, github)}</section>`;
const flow = items => `<div class="topic-flow">${items.map((item, index) => `${index ? '<i>→</i>' : ''}<span>${item}</span>`).join('')}</div>`;

function renderOpenSourceDirectory(text, github) {
  const groups = [
    [text.groups.editions, ['aquariumClaude', 'aquariumGlm', 'aquariumGrok']],
    [text.groups.coordination, ['dolgorae']],
    [text.groups.verification, ['gaori', 'mulgae']],
    [text.groups.documents, ['sanho', 'sorage']],
    [text.groups.agentOperations, ['atnControl', 'atnPlugin', 'agentDispatch', 'agentDispatchPlugin']],
  ];
  const primary = ['aquarium', 'podway'].map(id => repositoryAnchor(id, github)).join('');
  const sections = groups.map(([label, ids]) => `<section><h4>${escapeHtml(label)}</h4><div class="source-links">${ids.map(id => repositoryAnchor(id, github)).join('')}</div></section>`).join('');
  return `<nav class="open-source-directory" aria-label="${escapeHtml(text.label)}"><h3>${escapeHtml(text.title)}</h3><p class="topic-explanation">${escapeHtml(text.lead)}</p><div class="source-links open-source-primary">${primary}</div><div class="topic-columns">${sections}</div></nav>`;
}

function renderTechnologyBody(id, text, locale, github) {
  if (id === 'spark') {
    const href = locale === 'ko' ? 'https://home.rootkernel.xyz/ko/control/' : 'https://home.rootkernel.xyz/en/control/';
    return `${renderOpenSourceDirectory(text.openSource, github)}<p class="topic-explanation spark-explanation">${text.explanation}</p><div class="source-links"><a href="${href}" target="_blank" rel="noreferrer">${text.sourceLabel}</a></div>`;
  }
  if (id === 'podway') return `${flow(text.flow)}<div class="topic-return">${text.returnText}</div><p class="topic-explanation">${text.explanation}</p>${repositoryLink('podway', github)}<a class="text-link" href="${pageHref('home', locale)}#step=todo-fix">${text.homeLink}</a>`;
  if (id === 'aquarium') {
    const tools = ['Podway', 'Dolgorae', 'Gaori', 'Mulgae', 'Sanho', 'Sorage'];
    const toolFamily = tools.map((name, index) => `<span>${name}<small>${text.toolRoles[index]}</small></span>`).join('');
    const editionLinks = ['aquariumClaude', 'aquariumGlm', 'aquariumGrok'].map(id => repositoryLink(id, github)).join('');
    return `<div class="tool-family"><strong>Aquarium</strong><div>${toolFamily}</div></div>${repositoryLink('aquarium', github)}<div class="edition-links">${editionLinks}</div>`;
  }
  if (id === 'dolgorae') return `<div class="agent-team">${text.roles.map(([role, scope]) => `<span>${role}<small>${scope}</small></span>`).join('')}</div><p class="topic-explanation">${text.explanation}</p>${repositoryLink('dolgorae', github)}`;
  if (id === 'checks') return `<div class="topic-columns">${block('Gaori', text.gaori, 'gaori', github)}${block('Mulgae', text.mulgae, 'mulgae', github)}</div>`;
  if (id === 'documents') return `<div class="topic-columns">${block('Sanho', text.sanho, 'sanho', github)}${block('Sorage', text.sorage, 'sorage', github)}</div>`;
  if (id === 'atn') return `${flow(text.flow)}<div class="topic-columns">${block('ATN Control', text.control, 'atnControl', github)}${block('ATN Plugin', text.plugin, 'atnPlugin', github)}</div>`;
  if (id === 'dispatch') return `${flow(text.flow)}<div class="topic-columns">${block('Agent Dispatch', text.core, 'agentDispatch', github)}${block('Agent Dispatch Plugin', text.plugin, 'agentDispatchPlugin', github)}</div>`;
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
