import {homePanelTitle, renderHomePanel} from './home-panels.mjs?v=30652883d5c2fd2f';
import {getTechnologyContent, getProductData} from './topic-content.mjs?v=30652883d5c2fd2f';
import {getCompanyContent} from './company-content.mjs?v=30652883d5c2fd2f';

export const escapeHtml = text => String(text).replace(/[&<>"']/g, char => ({'&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;'}[char]));

export function panelTitle(id, locale = 'ko') {
  const products = getProductData(locale);
  const technology = getTechnologyContent(locale);
  return homePanelTitle(id, locale) || products[id]?.name || technology.find(topic => `tech-${topic.id}` === id)?.label || getCompanyContent(locale).find(topic => `company-${topic.id}` === id)?.label || id;
}

export function renderPanel(id, state, stage = 3, locale = 'ko') {
  const products = getProductData(locale);
  const technology = getTechnologyContent(locale);
  if (homePanelTitle(id, locale)) return renderHomePanel(id, state, stage, products, locale);
  const product = products[id];
  if (product) return `<article class="product-scene"><div class="product-heading"><div class="eyebrow">${product.number} / ${product.category}</div><h2>${product.name}</h2></div><figure><img src="/assets/images/${product.image}" alt="${product.alt}" width="1000" height="580"><figcaption>${product.caption}</figcaption></figure><div class="product-copy"><h3>${product.heading}</h3><p>${product.description}</p></div></article>`;
  const topic = technology.find(item => `tech-${item.id}` === id);
  if (topic) return `<article class="technology-scene"><div class="eyebrow">TECHNOLOGY / ${topic.label}</div><h2>${topic.title}</h2><p class="panel-lead">${topic.lead}</p>${topic.body}</article>`;
  const company = getCompanyContent(locale).find(item => `company-${item.id}` === id);
  if (company) return `<article class="company-scene company-panel-${company.id}"><div class="eyebrow">COMPANY / ${escapeHtml(company.label)}</div><h2>${escapeHtml(company.title)}</h2>${company.lead ? `<p class="panel-lead">${escapeHtml(company.lead)}</p>` : ''}${company.body}</article>`;
  throw new Error(`Missing panel: ${id}`);
}
