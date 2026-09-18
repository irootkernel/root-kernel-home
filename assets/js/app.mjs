import {compileScenario} from './engine.mjs?v=7377d0539e3c69ae';
import {getScenarios} from './story.mjs?v=7377d0539e3c69ae';
import {ui, languageHref, readNavigation, readStepHash} from './locale.mjs?v=7377d0539e3c69ae';
import {playbackSession} from './session.mjs?v=7377d0539e3c69ae';
import {renderPanel, panelTitle, escapeHtml as e} from './panels.mjs?v=7377d0539e3c69ae';
import {makeTimeline, locate, messageProgress, sampleScroll, remapPosition, navigatePosition, mobileChatOffset, glyphs, AI_START, AI_END} from './playback.mjs?v=7377d0539e3c69ae';

const page = document.body.dataset.page;
const locale = document.documentElement.lang;
const t = (key, values) => ui(locale, key, values);
const scenario = getScenarios(locale)[page];
const {readMode, restart} = readNavigation(location.search);
const session = scenario ? playbackSession(page, scenario.version, () => sessionStorage, locale) : null;
if (restart) {
  session?.clear();
  history.scrollRestoration = 'manual';
  const url = new URL(location.href);
  url.searchParams.delete('start');
  url.hash = '';
  history.replaceState(null, '', url.pathname + url.search);
  window.scrollTo(0, 0);
}
const languageLink = document.querySelector('[data-language-switch]');
if (languageLink) languageLink.href = languageHref(page, locale, readMode);
const $ = selector => document.querySelector(selector);

if (scenario && !readMode) start();

function start() {
  history.scrollRestoration = 'manual';
  const compiled = compileScenario(scenario);
  const frames = compiled.frames;
  const turns = compiled.turns;
  const mobileQuery = matchMedia('(max-width: 760px)');
  const motionQuery = matchMedia('(prefers-reduced-motion: reduce)');
  let mobile = mobileQuery.matches;
  let timeline = makeTimeline(compiled, mobile, locale);
  const scrollUnit = () => Math.max(800, innerHeight * 1.45) * (mobile ? 1.5625 : 1);
  let unit = scrollUnit();
  let frontier = 0;
  let position = 0;
  let lastRendered = '';
  let raf = 0;
  let targetPosition = 0;
  let targetChangedAt = 0;
  let frameTime = 0;
  const split = text => glyphs(text, locale);
  function typedMarkup(text, role) {
    return `<p class="typed-copy"><span class="typing-measure" aria-hidden="true">${e(text)}</span><span data-role="${role}"></span></p>`;
  }
  const texts = turns.map(turn => ({human: split(turn.human), ai: split(turn.ai)}));
  const pairs = turns.map((turn, index) => {
    const frame = frames[turn.segments[0].frameIndex];
    const pair = document.createElement('article');
    pair.className = 'chat-pair';
    pair.dataset.turnId = turn.id;
    pair.dataset.start = timeline.entries[index].start;
    pair.dataset.visitId = frame.visitId;
    pair.innerHTML = `<div class="message human"><div class="message-author"><span class="prompt-mark">›</span> YOU <small>${String(index + 1).padStart(2,'0')}</small></div>${typedMarkup(turn.human, 'human')}</div><div class="message ai"><div class="message-author"><span class="agent-mark">✳</span> ROOT KERNEL <small data-message-revision></small></div>${typedMarkup(turn.ai, 'ai')}<div class="mobile-material"></div></div>`;
    $('#chat-log').append(pair);
    return {element: pair, human: pair.querySelector('[data-role=human]'), ai: pair.querySelector('[data-role=ai]'), answer: pair.querySelector('.ai'), media: pair.querySelector('.mobile-material'), revision: pair.querySelector('[data-message-revision]')};
  });
  renderGraph();
  document.documentElement.classList.add('enhanced');
  $('#monitor').hidden = false;
  $('#runway').hidden = false;
  $('#story-fallback').hidden = true;
  {
    const saved = restart ? null : session.read();
    if (saved) {
      const oldTimeline = makeTimeline(compiled, !!saved.mobile, locale);
      frontier = remapPosition(oldTimeline, timeline, saved.frontier);
      position = saved.position === 0 ? 0 : remapPosition(oldTimeline, timeline, saved.position);
    }
  }
  function seekHash() {
    const hashStep=readStepHash(location.hash);
    const target=timeline.entries.find(entry=>entry.turn.id===hashStep);
    if(target) position=target.end-.025;
  }
  if (!restart) seekHash();
  window.addEventListener('hashchange',()=>{
    seekHash();
    frontier=Math.max(frontier,position);
    window.scrollTo(0,position*unit);
    update(true);
  });
  frontier = Math.max(frontier, position);
  resizeRunway();
  window.scrollTo(0, position * unit);
  update(true);
  clearTimeout(window.__rkEnhancementTimer);
  removeEventListener('error', window.__rkEnhancementRestore);
  removeEventListener('unhandledrejection', window.__rkEnhancementRestore);
  delete window.__rkEnhancementTimer;
  delete window.__rkEnhancementRestore;
  document.documentElement.classList.remove('enhancing');

  function resizeRunway() { $('#runway').style.height = `${timeline.length * unit + innerHeight}px`; }

  function save() {
    session.write({frontier, position, mobile});
  }
  function schedule() { if (!raf) raf = requestAnimationFrame(() => {raf = 0; update();}); }
  window.addEventListener('scroll', schedule, {passive: true});
  window.addEventListener('pagehide', save);
  document.addEventListener('visibilitychange', () => { if (document.hidden) save(); });
  window.addEventListener('resize', () => {
    const next = makeTimeline(compiled, mobileQuery.matches, locale);
    position = remapPosition(timeline, next, position);
    frontier = remapPosition(timeline, next, frontier);
    mobile = mobileQuery.matches;
    timeline = next;
    unit = scrollUnit();
    resizeRunway();
    lastRendered = '';
    window.scrollTo(0, position * unit);
    update(true);
  });
  motionQuery.addEventListener('change', schedule);
  document.fonts.ready.then(schedule);
  $('#previous').addEventListener('click', () => navigate(-1));
  $('#next').addEventListener('click', () => navigate(1));
  $('#latest').addEventListener('click', () => window.scrollTo({top: frontier * unit, behavior: 'instant'}));
  document.querySelectorAll('a').forEach(a => a.addEventListener('click', save));

  function navigate(direction) {
    window.scrollTo({top: navigatePosition(timeline, position, direction) * unit, behavior:motionQuery.matches ? 'instant' : 'smooth'});
  }

  function renderGraph() {
    const nodes = scenario.graph.nodes;
    const svgEdges = scenario.graph.edges.map(edge => {
      const from = nodes.find(n => n.id === edge.from), to = nodes.find(n => n.id === edge.to);
      const d = edge.kind === 'rollback' ? `M ${from.x} ${from.y+14} V 125 H ${to.x} V ${to.y+16}` : `M ${from.x+47} ${from.y} C ${from.x+70} ${from.y},${to.x-70} ${to.y},${to.x-49} ${to.y}`;
      return `<path d="${d}" class="graph-edge ${edge.kind || ''}" data-from="${from.id}" data-to="${to.id}" marker-end="url(#arrow)"/>`;
    }).join('');
    $('#fsm').innerHTML = `<svg viewBox="0 0 1170 143" role="img" aria-labelledby="graph-title graph-desc"><title id="graph-title">${page === 'home' ? t('homeGraphTitle') : t('flow')}</title><desc id="graph-desc">${page === 'home' ? t('homeGraphDescription') : nodes.map(n=>n.label).join(' → ')}</desc><defs><marker id="arrow" markerWidth="5" markerHeight="5" refX="4" refY="2.5" orient="auto"><path d="M0 0L5 2.5L0 5" fill="context-stroke"/></marker></defs>${svgEdges}${nodes.map(n => `<g class="graph-node pending" data-node-id="${n.id}" transform="translate(${n.x}, ${n.y})"><rect x="-47" y="-14" width="94" height="28" rx="3"/><text text-anchor="middle" dy="4">${e(n.label)}</text></g>`).join('')}${page === 'home' ? `<text class="return-label" x="705" y="139" text-anchor="middle">${e(t('rollback'))}</text>` : ''}</svg>`;
  }

  function update(immediate = false) {
    const now = performance.now();
    const target = Math.max(0, Math.min(timeline.length - 0.0001, scrollY / unit));
    if (target !== targetPosition) {
      targetPosition = target;
      targetChangedAt = now;
    }
    position = sampleScroll(position, target, frameTime ? now - frameTime : 16, now - targetChangedAt, immediate || motionQuery.matches);
    frameTime = now;
    $('#monitor').classList.toggle('scroll-settled', position === targetPosition);
    frontier = Math.max(frontier, position);
    const point = locate(timeline, position);
    const snapshot = point.snapshot;
    const viewFrame = point.committed ? point.frame : point.index ? timeline.entries[point.index-1].frames.at(-1) : point.frame;
    const scene = point.committed ? point.scenes[point.sceneIndex] : point.index ? timeline.entries[point.index-1].scenes.at(-1) : point.scenes[0];
    const progress = position / timeline.length;
    const historical = frontier - position > 0.05;
    let deliveredCount = 0;
    pairs.forEach((pair, index) => {
      const p = messageProgress(timeline, position, frontier, index, motionQuery.matches);
      if (p.delivered) deliveredCount++;
      pair.element.hidden = index > point.index || position < timeline.entries[index].start;
      pair.element.dataset.delivered = String(p.delivered);
      pair.element.classList.toggle('current', index === point.index);
      const human = texts[index].human.slice(0, Math.floor(texts[index].human.length * p.human)).join('');
      const ai = texts[index].ai.slice(0, Math.floor(texts[index].ai.length * p.ai + 1e-8)).join('');
      if (pair.human.textContent !== human) pair.human.textContent = human;
      if (pair.ai.textContent !== ai) pair.ai.textContent = ai;
      pair.answer.style.visibility = p.committed ? '' : 'hidden';
      pair.answer.setAttribute('aria-hidden', String(!p.committed));
      pair.answer.inert = !p.committed;
      pair.human.classList.toggle('typing', index === point.index && point.placementProgress === 1 && p.human < 1);
      pair.ai.classList.toggle('typing', index === point.index && p.committed && p.ai < 1);
      const entry = timeline.entries[index];
      const currentFrame = index === point.index ? viewFrame : entry.frames.at(-1);
      pair.element.dataset.visitId = currentFrame.visitId;
      pair.revision.textContent = `r${currentFrame.after.revision}`;
      pair.media.hidden = !mobile || !p.mediaVisible;
      pair.media.inert = pair.media.hidden;
      pair.media.setAttribute('aria-hidden', String(pair.media.hidden));
      if (mobile && p.mediaVisible) {
        const available = index < point.index ? entry.scenes.length : point.sceneIndex+1;
        const key = `${available}:mobile`;
        if (pair.media.dataset.rendered !== key) {
          const finalFrame = entry.frames.at(-1);
          pair.media.innerHTML = entry.scenes.slice(0,available).map(s=>`<div class="inline-scene" data-scene-id="${s.id}" data-visit-id="${finalFrame.visitId}">${renderPanel(s.id,finalFrame.after,3,locale)}</div>`).join('');
          pair.media.dataset.rendered = key;
        }
      }
    });
    const visit = snapshot.visits.find(v => v.id === viewFrame.visitId);
    $('#monitor').dataset.stepId = point.turn.id;
    $('#monitor').dataset.segmentId = point.committed ? point.segments[point.segmentIndex].id : '';
    $('#monitor').dataset.aiProgress = point.aiProgress.toFixed(4);
    $('#monitor').dataset.mediaVisible = String(point.mediaVisible);
    $('#monitor').dataset.readingHold = String(point.holding);
    $('#monitor').dataset.questionPositioning = String(point.placementProgress < 1);
    $('#monitor').dataset.timelineLength = timeline.length;
    $('#monitor').dataset.viewVisitId = visit?.id || '';
    $('#monitor').dataset.revision = snapshot.revision;
    $('#monitor').dataset.sceneId = scene.id;
    $('#monitor').dataset.frontier = frontier.toFixed(4);
    $('#monitor').dataset.position = position.toFixed(4);
    $('#monitor').dataset.scrollTarget = targetPosition.toFixed(4);
    $('#monitor').dataset.deliveredCount = deliveredCount;
    $('#monitor').dataset.activeNodes = snapshot.activeNodes.join(',');
    $('#monitor').dataset.archivedCount = snapshot.archivedEvidence.length;
    $('#monitor').dataset.branchStates = snapshot.branches.map(b=>`${b.id}:${b.status}`).join(',');
    const nodeLabel = scenario.graph.nodes.find(n => n.id === snapshot.focusNodeId)?.label || t('start');
    $('#current-node').textContent = nodeLabel;
    $('#revision').textContent = `r${snapshot.revision}`;
    $('#chat-count').textContent = `${String(deliveredCount).padStart(2,'0')} TURNS`;
    $('#playback-state').textContent = historical ? t('historical') : '';
    $('#latest').hidden = !historical;
    $('#step-counter').textContent = `${String(point.index+1).padStart(2,'0')} / ${String(turns.length).padStart(2,'0')}`;
    $('#progress-fill').style.width = `${progress*100}%`;
    $('#next').disabled = navigatePosition(timeline, position, 1) <= position + 0.01;
    $('#previous').disabled = position < 0.01;
    const pending = snapshot.branches.filter(b => b.required && b.status==='running').length;
    $('#fsm-status').textContent = pending ? t('branchesRunning',{n:pending}) : snapshot.branches.length ? t('branchesComplete',{n:snapshot.branches.filter(b=>b.required).length}) : 'STORY MAP';
    scenario.graph.nodes.forEach(node => {
      const el = document.querySelector(`[data-node-id="${node.id}"]`);
      const state = snapshot.nodeStates[node.id] || 'pending';
      el.setAttribute('class', `graph-node ${state} ${snapshot.focusNodeId===node.id?'focused':''}`);
      const visits = snapshot.visits.filter(v=>v.nodeId===node.id);
      el.classList.toggle('revisited', visits.length > 1);
    });
    document.querySelectorAll('.graph-edge').forEach(edge => {
      edge.classList.toggle('lit', !edge.classList.contains('rollback') && snapshot.nodeStates[edge.dataset.to] && !['pending','invalidated'].includes(snapshot.nodeStates[edge.dataset.to]));
      edge.classList.toggle('return-active', edge.classList.contains('rollback') && point.frame.step.command.type === 'rollback' && point.committed);
    });
    const stage = Math.min(3, Math.floor(point.aiProgress * 4));
    const key = `${viewFrame.id}:${scene.id}:${point.committed}:${stage}`;
    if (lastRendered !== key) {
      $('#content').innerHTML = renderPanel(scene.id, snapshot, stage, locale);
      $('#content').dataset.visitId = visit?.id || '';
      $('#content-label').textContent = panelTitle(scene.id, locale);
      $('#scene-counter').textContent = point.committed && point.scenes.length > 1 ? `${point.sceneIndex+1} / ${point.scenes.length}` : '';
      lastRendered = key;
    }
    const enterProgress = point.committed ? Math.min(1, (point.dialogueLocal - AI_START) / 0.1) : 1;
    $('#content').style.opacity = motionQuery.matches ? 1 : 0.25 + enterProgress * 0.75;
    $('#content').style.transform = motionQuery.matches ? 'none' : `translateY(${(1-enterProgress)*10}px)`;
    const currentPair = pairs[point.index].element;
    const viewport = $('#chat-viewport');
    // A single document scrollbar moves the reading window. No independently
    // scrolling pane can drift away from the shared historical checkpoint.
    const top = currentPair.offsetTop;
    const fullHeight = currentPair.offsetHeight;
    const viewHeight = viewport.clientHeight;
    const mediaHeight = pairs[point.index].media.hidden ? 0 : pairs[point.index].media.offsetHeight;
    let offset;
    if (mobile) {
      const previousPair = pairs[point.index-1]?.element;
      offset = mobileChatOffset({top,fullHeight,viewHeight,mediaHeight,
        answerHeight:pairs[point.index].answer.offsetHeight,
        aiProgress:point.aiProgress,placementProgress:point.placementProgress,mediaProgress:point.mediaProgress,
        previousBottom:previousPair ? previousPair.offsetTop+previousPair.offsetHeight : 0});
    } else {
      const answerHeight = pairs[point.index].answer.offsetHeight;
      const visibleHeight = fullHeight - answerHeight + answerHeight * point.aiProgress;
      offset = Math.max(0, top + visibleHeight - viewHeight + 44);
    }
    $('#chat-log').style.transform = `translateY(${-offset}px)`;
    const bounds = viewport.getBoundingClientRect();
    pairs.forEach(pair => {
      const rect = pair.element.getBoundingClientRect();
      pair.element.inert = pair.element.hidden || rect.bottom <= bounds.top || rect.top >= bounds.bottom;
    });
    const statusText = t('announcement',{node:nodeLabel,revision:snapshot.revision,turn:point.index+1});
    if ($('#live-status').textContent !== statusText) $('#live-status').textContent = statusText;
    if (position !== targetPosition) schedule();
  }
}
