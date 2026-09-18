import ko from './company-content.ko.mjs?v=fe5964d6adc705a5';
import en from './company-content.en.mjs?v=fe5964d6adc705a5';
import {pageHref} from './locale.mjs?v=fe5964d6adc705a5';

const resources = {ko, en};
const order = ['founding', 'founder', 'name', 'naming', 'history'];
const dates = ['2026.01', '2026.02', '2026.04', '2026.06', '2026.07'];
const e = text => String(text).replace(/[&<>"']/g, char => ({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[char]));

export function validateCompanyCopy(candidate = resources) {
  function check(reference, value, path) {
    if (reference && typeof reference === 'object') {
      if (!value || typeof value !== 'object' || Array.isArray(value) !== Array.isArray(reference) || JSON.stringify(Object.keys(value).sort()) !== JSON.stringify(Object.keys(reference).sort())) throw new Error(`Missing company translation: ${path}`);
      for (const key of Object.keys(reference)) check(reference[key], value[key], `${path}.${key}`);
    } else if (typeof value !== 'string' || !value.trim()) throw new Error(`Missing company translation: ${path}`);
  }
  for (const locale of ['ko', 'en']) check(ko, candidate[locale], locale);
  return true;
}
validateCompanyCopy();

function body(id, text, locale) {
  if (id === 'founding') return `<div class="company-identity"><img src="/assets/rootkernel-symbol.svg" alt="Root Kernel" width="200" height="70"><span>ROOT KERNEL</span></div><dl class="company-facts">${text.facts.map(([label,value])=>`<div><dt>${e(label)}</dt><dd>${e(value)}</dd></div>`).join('')}</dl>`;
  if (id === 'founder') return `<ol class="company-career">${text.steps.map(([place,title,description])=>`<li><span>${e(place)}</span><h3>${e(title)}</h3><p>${e(description)}</p></li>`).join('')}</ol><section class="company-evidence"><h3>${e(text.evidenceTitle)}</h3><p>${e(text.evidence)}</p></section>`;
  if (id === 'name') return `<div class="company-name"><section><h3>Root<span>_</span></h3><p>${e(text.root)}</p></section><section><h3>Kernel<span>_</span></h3><p>${e(text.kernel)}</p></section></div><p class="company-meaning">${e(text.meaning)}</p>`;
  if (id === 'naming') return `<ol class="company-habitats">${text.bands.map(([name,meaning,examples],i)=>`<li><span class="company-index">0${i+1}</span><h3>${e(name)}</h3><p>${e(meaning)}</p><div>${e(examples)}</div></li>`).join('')}</ol><div class="company-links"><a href="${pageHref('technology',locale)}#step=tech-aquarium">${e(text.technologyLink)}</a><a href="${pageHref('products',locale)}">${e(text.productsLink)}</a></div>`;
  if (id === 'history') return `<div class="company-history-layout"><ol class="company-history">${text.milestones.map((description,i)=>`<li><time datetime="${dates[i].replace('.','-')}">${dates[i]}</time><p>${e(description)}</p></li>`).join('')}</ol><section class="company-project"><h3>${e(text.projectTitle)}</h3><div class="company-period"><time datetime="2026-08">2026.08</time><span>~</span><time datetime="2026-12">2026.12</time></div><p>${e(text.project)}</p></section></div>`;
  throw new Error(`Missing company panel: ${id}`);
}

export function getCompanyContent(locale = 'ko') {
  const selected = resources[locale];
  if (!selected) throw new Error(`Unsupported company locale: ${locale}`);
  return order.map(id => ({...selected[id], id, body: body(id, selected[id], locale)}));
}
