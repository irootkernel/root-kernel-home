import { nodeStatuses } from './reducer.mjs';

const escapeHTML = value => String(value).replace(/[&<>"']/g, char => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' })[char]);

const labels = {
  ko: { active: '진행 중', complete: '완료', pass: '통과', fail: '실패', running: '진행 중', blocked: '차단', invalid: '재검증 필요', future: '대기',
    tests: '테스트', review: '리뷰', records: '기록 정리', normal: '정상 흐름 확인', recovery: '복구 조건 누락', preserved: '근거 보존' },
  en: { active: 'Active', complete: 'Complete', pass: 'Pass', fail: 'Fail', running: 'Running', blocked: 'Blocked', invalid: 'Needs recheck', future: 'Queued',
    tests: 'Tests', review: 'Review', records: 'Records', normal: 'Normal path checked', recovery: 'Recovery condition missing', preserved: 'Evidence preserved' }
};

const stateLabel = (value, locale) => labels[locale][value] || value;
const stateMark = value => ({ active: '▶', running: '▶', complete: '✓', pass: '✓', fail: '×', blocked: '!', invalid: '↻', future: '○' })[value] || '○';

function evidence(locale, work) {
  const t = labels[locale];
  const rows = [[t.tests, 'tests'], [t.review, 'review'], [t.records, 'records']];
  return `<div class="evidence-grid">${rows.map(([name, lane], index) => {
    const value = work.lanes[lane]?.revision === work.revision ? work.lanes[lane].outcome : 'running';
    const detail = value === 'running' ? t.running : index === 0 && value === 'pass' ? t.normal : index === 1 && value === 'fail' ? t.recovery : index === 2 && value === 'pass' ? t.preserved : stateLabel(value, locale);
    const icon = value === 'pass' ? '✓' : value === 'fail' ? '×' : '…';
    return `<section class="evidence-card ${value}" data-revision="${work.revision}" style="--lane:${index}"><div class="evidence-state"><span aria-hidden="true">${icon}</span><h3>${escapeHTML(name)}</h3><strong>${stateLabel(value, locale)}</strong></div><p>r${work.revision} · ${escapeHTML(detail)}</p></section>`;
  }).join('')}</div>`;
}

function media(asset, href, ui) {
  const slug = href.match(/\/products\/([^/]+)\/$/)?.[1];
  return `<figure class="product-media"><div class="media-frame"><img src="${asset.src}" width="${asset.width}" height="${asset.height}" alt="${escapeHTML(asset.alt)}"><div class="image-fallback" hidden>${escapeHTML(asset.label)}</div></div><figcaption><span>${escapeHTML(asset.label)}</span><a id="story-detail-${escapeHTML(slug)}" href="${href}" data-quick>${escapeHTML(ui.products)}<svg aria-hidden="true" viewBox="0 0 16 16"><path d="M3 8h9M9 4l4 4-4 4"/></svg></a></figcaption></figure>`;
}

function principles(data) {
  return `<ol class="principle-list">${data.principles.map((item, order) => `<li style="--row:${order}"><span>0${order + 1}</span><div><strong>${escapeHTML(item)}</strong></div></li>`).join('')}</ol>`;
}

export function visualMarkup(beat, data, checkpoint) {
  const { locale, ui, media: assets } = data;
  const ko = locale === 'ko';
  const work = checkpoint.work;
  switch (beat.visual) {
    case 'identity': return `<div class="identity-diagram" aria-hidden="true"><span>ROOT</span><i></i><span>KERNEL</span><b>✓ VERIFIED · W01</b></div>`;
    case 'problem': return `<div class="compare"><section><span>01</span><h3>${ko ? '코드 생성' : 'Code generation'}</h3></section><svg aria-hidden="true" viewBox="0 0 40 40"><path d="M5 20h30M20 5v30"/></svg><section><span>02</span><h3>${ko ? '검토와 복구' : 'Review and recovery'}</h3></section></div>`;
    case 'boundary': return `<div class="boundary"><section><span>${ko ? '사람' : 'People'}</span><strong>${ko ? '의도 · 경계 · 최종 승인' : 'Intent · boundary · final approval'}</strong></section><div class="boundary-line"><i></i><b>W01</b></div><section><span>AI</span><strong>${ko ? '정해진 범위 안에서 실행' : 'Execution within the defined scope'}</strong></section></div>`;
    case 'principles': return `<div class="spec-and-principles"><div class="spec-sheet"><header><span>r1</span><strong>SPEC</strong></header><dl><div><dt>${ko ? '목표' : 'Goal'}</dt><dd>W01</dd></div><div><dt>${ko ? '작업 범위' : 'Scope'}</dt><dd>W02</dd></div><div><dt>${ko ? '완료 기준' : 'Completion criteria'}</dt><dd>W03</dd></div><div><dt>${ko ? '검증 조건' : 'Validation conditions'}</dt><dd>W05–W08</dd></div><div><dt>${ko ? '복구 경로' : 'Recovery path'}</dt><dd>W08 ⇢ W02</dd></div></dl></div>${principles(data)}</div>`;
    case 'spec': return `<div class="scope-record"><div class="record-head"><span>${ko ? '예시 명세 기록' : 'Example specification record'}</span><b>r1</b></div><div class="record-row"><span>${ko ? '구조·참조 검사' : 'Structure/reference check'}</span><strong>✓ ${ko ? '통과' : 'Pass'}</strong></div><div class="record-row muted"><span>${ko ? '요구사항 검토' : 'Requirements review'}</span><strong>${ko ? '구현 후 별도 확인' : 'Checked separately after build'}</strong></div></div>`;
    case 'products': return `<div class="product-overview">${['sudal', 'doksuri', 'ember'].map((key, index) => `<a id="story-product-${key}" href="/${locale}/products/${['sudal', 'doksuri', 'ember-quest'][index]}/" data-quick style="--product:${index}"><div class="overview-media"><img src="${assets[key].src}" alt=""><div class="image-fallback" hidden>${escapeHTML(assets[key].label)}</div></div><span>${['Sudal', 'Doksuri', 'Ember Quest'][index]}</span><small>${escapeHTML(assets[key].label)}</small></a>`).join('')}</div>`;
    case 'sudal': return media(assets.sudal, `/${locale}/products/sudal/`, ui);
    case 'doksuri': return `<div class="doksuri-scene">${media(assets.doksuri, `/${locale}/products/doksuri/`, ui)}<div class="change-compare"><span>MARKDOWN</span><i></i><span>${ko ? '변경 버전 비교' : 'Compare revisions'}</span></div></div>`;
    case 'ember': return media(assets.ember, `/${locale}/products/ember-quest/`, ui);
    case 'parallel': return `<div class="parallel-scene"><div class="fork-label"><span>W04</span><i></i></div>${evidence(locale, work)}<div class="join-label"><i></i><span>AND → W08</span></div></div>`;
    case 'evidence': return evidence(locale, work);
    case 'tools': return `<div class="tools-scene">${evidence(locale, work)}<div class="tool-map"><section><span>AI HARNESS</span><strong>Aquarium</strong></section><i></i><section><strong>Agent Dispatch</strong><small>${ko ? '파일 변경 → 작업' : 'File change → work'}</small></section><section><strong>ATN</strong><small>${ko ? '토론 → 기록' : 'Discussion → record'}</small></section></div></div>`;
    case 'blocked': return `<div class="blocked-scene">${evidence(locale, work)}<div class="blocked-route"><span>W08</span><i></i><span class="blocked">× W09 · ${stateLabel('blocked', locale)}</span><b>⇢ W02 · ${ko ? '재작업' : 'Rework'}</b></div></div>`;
    case 'stack': return `<div class="control-stack"><section><span>AI-SPARK</span><p>SPEC ↔ REVISION KEY</p></section><i></i><section><span>FSM RUNTIME</span><p>${ko ? '선언된 상태 전이' : 'Declared state transitions'}</p></section><i></i><section><span>Podway</span><p>${ko ? '진행 조건 · 재작업 경로' : 'Progress conditions · rework paths'}</p></section></div>`;
    case 'rework': return `<div class="revision-scene"><div class="revision-route"><span>W08</span><i></i><span>W02</span></div><div class="revision-compare"><section class="old"><span>r1 · ${ko ? '이력' : 'History'}</span><strong>× ${labels[locale].recovery}</strong><small>${ko ? '실패 근거 보존' : 'Failed evidence preserved'}</small></section><svg aria-hidden="true" viewBox="0 0 40 24"><path d="M2 12h32M28 5l7 7-7 7"/></svg><section class="new"><span>r2 · ${ko ? '현재' : 'Current'}</span><strong>+ ${ko ? '복구 조건' : 'Recovery condition'}</strong><small>${ko ? '다시 검증 필요' : 'Validation required again'}</small></section></div></div>`;
    case 'rerun': return `<div class="trace-list">${['W02', 'W03', 'W04', 'W05 ∥ W06 ∥ W07'].map((item, index) => `<span data-status="${index === 3 ? 'running' : 'complete'}" style="--row:${index}">${item}<i>${index === 3 ? '…' : '✓'}</i></span>`).join('')}</div>`;
    case 'verified': return `<div class="verified-scene">${evidence(locale, work)}<div class="archive-record"><span>r1 · ${ko ? '보존된 실패 근거' : 'Archived failed evidence'}</span><strong>${labels[locale].review} × ${labels[locale].recovery}</strong></div><div class="join-pass">W08 · ✓ ${ko ? '현재 revision 근거 확인' : 'Current-revision evidence checked'}</div></div>`;
    case 'decision': return `<div class="decision-boundary"><span>${ko ? '준비된 예시 판단 기록 · r2' : 'Prepared example decision record · r2'}</span><div><p>AI</p><strong>${ko ? '작업과 검토' : 'Work and review'}</strong></div><i></i><div><p>${ko ? '사람' : 'Human'}</p><strong>${ko ? '중요한 결정과 최종 승인' : 'Consequential decisions and final approval'}</strong></div></div>`;
    case 'complete': return `<div class="completion-scene"><div class="completion-record"><span>${ko ? '준비된 예시 완료 기록 · r2' : 'Prepared example completion record · r2'}</span><dl><dt>${ko ? '결과' : 'Result'}</dt><dd>W10 · ${ko ? '완료' : 'Complete'}</dd><dt>${ko ? '근거' : 'Evidence'}</dt><dd>W05 ∥ W06 ∥ W07</dd><dt>${ko ? '이력' : 'History'}</dt><dd>r1 → r2</dd></dl></div><div class="feedback-loop"><span>${ko ? '제품' : 'Products'}</span><i></i><span>${ko ? '기술 개선' : 'Technology improvement'}</span><i></i><span>${ko ? '제품 적용' : 'Applied to products'}</span></div></div>`;
    case 'contact': return `<div class="contact-panel">${data.products.map(product=>`<a href="/${locale}/products/${product.slug}/" data-quick>${escapeHTML(product.name)}<span aria-hidden="true">→</span></a>`).join('')}<a href="mailto:cs@rootkernel.xyz">cs@rootkernel.xyz<svg aria-hidden="true" viewBox="0 0 16 16"><path d="M3 8h9M9 4l4 4-4 4"/></svg></a><a href="https://github.com/irootkernel">${escapeHTML(ui.source)}<svg aria-hidden="true" viewBox="0 0 16 16"><path d="M3 8h9M9 4l4 4-4 4"/></svg></a><button type="button" data-restart>${escapeHTML(ui.restart)}<span aria-hidden="true">↻</span></button></div>`;
    default: return '';
  }
}

function displayStatuses(checkpoint) {
  return nodeStatuses({ ...checkpoint, rejection: checkpoint.displayRejection });
}

export function updateGraph(checkpoint, root, data, inspectedNode = null) {
  const statuses = displayStatuses(checkpoint);
  root.querySelectorAll('[data-node]').forEach(node => {
    const value = statuses[node.dataset.node] || 'future';
    node.dataset.status = value;
    node.toggleAttribute('data-inspected', node.dataset.node === inspectedNode);
    node.setAttribute('aria-pressed', String(node.dataset.node === inspectedNode));
    node.setAttribute('aria-label', `${node.dataset.node} ${node.querySelector('.node-label')?.textContent || ''}: ${stateLabel(value, data.locale)}`);
    const marker = node.querySelector('.node-state');
    if (marker) marker.textContent = stateMark(value);
  });
  root.querySelectorAll('[data-inspect]').forEach(node => {
    const selected = node.dataset.inspect === inspectedNode;
    node.toggleAttribute('data-inspected', selected);
    node.setAttribute('aria-pressed', String(selected));
  });
  root.querySelectorAll('[data-edge]').forEach(edge => {
    const [source, target] = edge.dataset.edge.split('-');
    const blocked = checkpoint.displayRejection === 'EVIDENCE_FAILED' && source === 'W08' && target === 'W09';
    edge.classList.toggle('blocked', blocked);
    edge.dataset.flow = ['complete', 'active', 'pass', 'fail', 'blocked'].includes(statuses[source]) ? 'reached' : 'future';
  });
  const nodes = data.nodes.map(node => `${node.id} ${node[data.locale]}: ${stateLabel(statuses[node.id], data.locale)}`).join('. ');
  const edges = data.edges.map(edge => `${edge[0]} → ${edge[1]}${edge[2] === 'rework' ? ` (${data.locale === 'ko' ? '재작업' : 'rework'})` : ''}`).join(', ');
  const description = `${nodes}. ${data.locale === 'ko' ? '방향 간선' : 'Directed edges'}: ${edges}.`;
  root.querySelectorAll('#graph-text, .inline-graph-text').forEach(element => { element.textContent = description; });
  return statuses;
}

function nodeButton(id, statuses, data) {
  const node = data.nodes.find(item => item.id === id);
  const state = statuses[id];
  return `<button type="button" data-inspect="${id}" class="local-node ${state}"><span>${id}</span><strong>${escapeHTML(node[data.locale])}</strong><small>${stateLabel(state, data.locale)}</small></button>`;
}

export function mobileGraphMarkup(beat, checkpoint, data) {
  const statuses = displayStatuses(checkpoint);
  const has = (source, target, kind = null) => data.edges.some(edge => edge[0] === source && edge[1] === target && (kind === null || edge[2] === kind));
  if (beat.focus.some(id => ['W05', 'W06', 'W07'].includes(id))) {
    const lanes = ['W05', 'W06', 'W07'].filter(id => beat.focus.includes(id));
    const source = beat.focus.includes('W04');
    const join = beat.focus.includes('W08') && lanes.every(id => has(id, 'W08'));
    return `<div class="local-branch${source ? '' : ' no-source'}${join ? '' : ' no-join'}">${source ? `<div>${nodeButton('W04', statuses, data)}<span aria-hidden="true">↘</span></div>` : ''}<div class="local-lanes">${lanes.map(id => nodeButton(id, statuses, data)).join('')}</div>${join ? `<div><span aria-hidden="true">AND ↓</span>${nodeButton('W08', statuses, data)}</div>` : ''}</div>`;
  }
  if (beat.focus.includes('W08') && beat.focus.includes('W02') && has('W08', 'W02', 'rework')) {
    const blocked = beat.focus.includes('W09') ? `<span class="blocked-edge" aria-hidden="true">×</span>${nodeButton('W09', statuses, data)}` : '';
    const onward = beat.focus.includes('W03') ? `<span aria-hidden="true">→</span>${nodeButton('W03', statuses, data)}` : '';
    return `<div class="local-rework"><div>${nodeButton('W08', statuses, data)}${blocked}</div><div class="rework-edge"><span>↳ ${data.locale === 'ko' ? '재작업' : 'Rework'}</span>${nodeButton('W02', statuses, data)}${onward}</div></div>`;
  }
  return `<div class="local-sequence">${beat.focus.map((id, index) => `${index ? '<span aria-hidden="true">→</span>' : ''}${nodeButton(id, statuses, data)}`).join('')}</div>`;
}

export function quickViewMarkup(slug, data) {
  const detail = data.details[slug];
  if (!detail) return '';
  const asset = detail.image ? data.media[detail.image] : null;
  const image = asset ? `<figure class="quick-media"><div class="media-frame"><img src="${asset.src}" width="${asset.width}" height="${asset.height}" alt="${escapeHTML(asset.alt)}"><div class="image-fallback" hidden>${escapeHTML(asset.label)}</div></div><figcaption>${escapeHTML(asset.label)}</figcaption></figure>` : '';
  const paragraphs = detail.paragraphs.map(text => `<p>${escapeHTML(text)}</p>`).join('');
  const products = slug === 'products' ? `<nav class="quick-product-links">${data.products.map(product => `<a id="quick-product-${product.slug}" href="/${data.locale}/products/${product.slug}/" data-quick><span>${product.name}</span><svg aria-hidden="true" viewBox="0 0 16 16"><path d="M3 8h9M9 4l4 4-4 4"/></svg></a>`).join('')}</nav>` : '';
  const contact = slug === 'contact' ? `<div class="contact-panel"><a href="mailto:cs@rootkernel.xyz">cs@rootkernel.xyz</a><a href="https://github.com/irootkernel">${escapeHTML(data.ui.source)}</a></div>` : '';
  const technology = slug === 'control' ? `<p class="demo-disclosure">${data.locale === 'ko' ? '준비된 브라우저 로컬 시연이며 실제 AI 또는 Podway 실행이 아닙니다.' : 'This is a prepared browser-local demonstration, not a live AI or Podway runtime.'}</p><nav class="quick-product-links"><a href="/${data.locale}/ai-harness/" data-quick><span>AI Harness · Aquarium</span><span aria-hidden="true">→</span></a><a href="/${data.locale}/ai-agents/" data-quick><span>Agent Dispatch · ATN</span><span aria-hidden="true">→</span></a><a href="/${data.locale}/control/procedure/"><span>Podway · 00–21</span><span aria-hidden="true">→</span></a></nav>` : '';
  return `<article><button class="return-link" type="button" data-return>← ${escapeHTML(data.ui.return)}</button><p class="detail-index">ROOT KERNEL / ${escapeHTML(detail.title.toUpperCase())}</p><h1 id="quick-title" tabindex="-1">${escapeHTML(detail.title)}</h1><p class="detail-lead">${escapeHTML(detail.lead)}</p>${image}<section>${paragraphs}${products}${technology}${contact}</section></article>`;
}
