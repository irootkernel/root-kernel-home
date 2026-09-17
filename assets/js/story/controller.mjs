import { initialWorkState, reduceWork } from './reducer.mjs';

let runSequence = 0;

const copy = value => structuredClone(value);
const validProgress = value => Number.isFinite(value) && value >= 0 && value <= 1;

export class StoryController {
  constructor({ beats, onChange, reducedMotion = false, version = '2' }) {
    this.beats = beats;
    this.onChange = onChange;
    this.reducedMotion = reducedMotion;
    this.version = String(version);
    this.startNewRun();
  }

  startNewRun() {
    if (this.paused) return false;
    runSequence += 1;
    const unique = globalThis.crypto?.randomUUID?.() || `${Date.now().toString(36)}-${runSequence}-${Math.random().toString(36).slice(2)}`;
    this.runId = `homepage-${unique}`;
    this.index = 0;
    this.frontier = 0;
    this.liveWork = initialWorkState();
    this.eventLedger = new Set();
    this.checkpoints = new Map([[0, {
      beatId: this.beats[0].id, work: copy(this.liveWork), rejection: null,
      displayRejection: null, trace: [], eventCount: 0
    }]]);
    this.views = new Map([[0, { progress: 1, presentation: 'settled' }]]);
    this.paused = false;
    this.inspectedNode = null;
    this.diagnostic = null;
  }

  checkpoint(index = this.index) { return this.checkpoints.get(index); }
  view(index = this.index) { return this.views.get(index) || { progress: 1, presentation: 'settled' }; }

  snapshot() {
    const view = this.view();
    return {
      runId: this.runId, index: this.index, frontier: this.frontier,
      progress: view.progress, presentation: this.paused ? 'paused' : view.presentation,
      beat: this.beats[this.index], checkpoint: copy(this.checkpoint()),
      reducedMotion: this.reducedMotion, eventCount: this.eventLedger.size,
      diagnostic: this.diagnostic ? copy(this.diagnostic) : null
    };
  }

  emit(options = {}) { this.onChange(this.snapshot(), options); }

  reduceBeat(index) {
    if (this.paused) return null;
    if (index !== this.frontier + 1) throw new Error(`non-contiguous frontier: ${index}`);
    const beat = this.beats[index];
    let state = copy(this.liveWork);
    let rejection = null;
    let displayRejection = this.checkpoint(this.frontier).displayRejection;
    const trace = [];
    const stagedKeys = [];
    const expected = beat.expected;
    const fail = reason => {
      this.diagnostic = { type: 'UNEXPECTED_REJECTION', beatId: beat.id, reason };
      this.emit({ diagnostic: true });
      return null;
    };
    for (const [ordinal, event] of beat.events.entries()) {
      const key = `${this.runId}:${beat.id}:${ordinal}`;
      if (this.eventLedger.has(key)) return fail('DUPLICATE_EVENT');
      const result = reduceWork(state, event);
      trace.push({ key, type: event.type, accepted: result.accepted, reason: result.reason });
      if (result.accepted) state = result.after;
      else {
        rejection = result.reason;
        if (!expected || result.reason !== expected[2] || ordinal !== beat.events.length - 1) return fail(result.reason);
      }
      stagedKeys.push(key);
    }
    if (!expected || state.phase !== expected[0] || state.revision !== expected[1] || rejection !== expected[2]) {
      return fail('EXPECTED_CHECKPOINT_MISMATCH');
    }
    if (rejection) displayRejection = rejection;
    if (beat.events.some(event => event.type === 'REWORK')) displayRejection = null;
    stagedKeys.forEach(key => this.eventLedger.add(key));
    this.liveWork = state;
    this.frontier = index;
    this.diagnostic = null;
    const checkpoint = { beatId: beat.id, work: copy(state), rejection, displayRejection, trace, eventCount: this.eventLedger.size };
    this.checkpoints.set(index, checkpoint);
    return checkpoint;
  }

  enter(index, direction = 1) {
    if (this.paused) return false;
    const target = Math.max(0, Math.min(this.beats.length - 1, index));
    if (target > this.frontier + 1) return false;
    if (target === this.frontier + 1 && !this.reduceBeat(target)) return false;
    this.index = target;
    const beat = this.beats[target];
    const firstVisit = !this.views.has(target);
    let view;
    if (firstVisit) {
      const progress = beat.mode === 'scrub' && !this.reducedMotion ? 0 : 1;
      const presentation = this.reducedMotion || beat.mode === 'static' ? 'settled' : beat.mode === 'scrub' ? 'scrubbing' : 'cue';
      view = { progress, presentation };
      this.views.set(target, view);
    } else {
      view = this.views.get(target);
      if (direction < 0 && view.presentation !== 'scrubbing') view.presentation = 'settled';
    }
    this.diagnostic = null;
    this.emit({ enter: true, direction, firstVisit });
    return true;
  }

  next() {
    if (this.paused) return false;
    this.settle();
    if (this.index >= this.beats.length - 1) return false;
    return this.enter(this.index + 1, 1);
  }

  previous() {
    if (this.paused) return false;
    this.settle();
    if (this.index <= 0) return false;
    return this.enter(this.index - 1, -1);
  }

  scrub(delta) {
    const beat = this.beats[this.index];
    const view = this.view();
    if (beat.mode !== 'scrub' || this.reducedMotion || this.paused) return { handled: false, boundary: 0 };
    const next = Math.max(0, Math.min(1, view.progress + delta));
    if (next === view.progress) return { handled: false, boundary: delta > 0 ? 1 : -1 };
    view.progress = next;
    view.presentation = next === 1 ? 'settled' : 'scrubbing';
    this.emit({ progress: true });
    return { handled: true, boundary: 0 };
  }

  settle() {
    if (this.paused) return false;
    const view = this.view();
    view.progress = 1;
    view.presentation = 'settled';
    return true;
  }

  settleCue() {
    if (this.paused) return false;
    const view = this.view();
    if (view.presentation !== 'cue') return false;
    view.presentation = 'settled';
    view.progress = 1;
    this.emit({ cueSettled: true });
    return true;
  }

  pause() {
    if (this.paused) return false;
    this.paused = true;
    this.emit({ paused: true });
    return true;
  }

  resume(anchor) {
    if (!this.paused) return false;
    if (!this.restore(anchor, { resume: true, silent: true })) return false;
    this.paused = false;
    this.emit({ resume: true, restore: true });
    return true;
  }

  setReducedMotion(value) {
    this.reducedMotion = value;
    this.settle();
    this.emit({ preference: true });
  }

  anchor(focusId = null) {
    const snapshot = this.snapshot();
    return { manifestVersion: this.version, runId: snapshot.runId, index: snapshot.index, beatId: snapshot.beat.id,
      frontier: snapshot.frontier, frontierBeatId: this.beats[snapshot.frontier].id,
      checkpointKey: `${snapshot.runId}:${snapshot.beat.id}:${snapshot.checkpoint.eventCount}`, progress: snapshot.progress,
      presentation: snapshot.presentation === 'paused' ? this.view().presentation : snapshot.presentation,
      eventCount: snapshot.eventCount, focusId, inspectedNode: this.inspectedNode,
      reducedMotion: this.reducedMotion };
  }

  restore(anchor, options = {}) {
    if (this.paused && !options.resume) return false;
    if (!anchor || anchor.manifestVersion !== this.version || anchor.runId !== this.runId || !Number.isInteger(anchor.index) || !Number.isInteger(anchor.frontier) || !this.checkpoints.has(anchor.index) || this.beats[anchor.index].id !== anchor.beatId || this.beats[anchor.frontier]?.id !== anchor.frontierBeatId || anchor.checkpointKey !== `${this.runId}:${anchor.beatId}:${this.checkpoint(anchor.index).eventCount}`) return false;
    this.index = anchor.index;
    const view = this.view(anchor.index);
    if (validProgress(anchor.progress)) view.progress = anchor.progress;
    if (['settled', 'scrubbing', 'cue'].includes(anchor.presentation)) view.presentation = anchor.presentation;
    this.inspectedNode = anchor.inspectedNode || null;
    if (!options.silent) this.emit({ restore: true, ...options });
    return true;
  }

  restoreTransferredAnchor(anchor) {
    if (this.paused || !anchor || anchor.manifestVersion !== this.version ||
        typeof anchor.runId !== 'string' || !/^homepage-[a-z0-9-]{8,100}$/.test(anchor.runId) ||
        !Number.isInteger(anchor.index) || !Number.isInteger(anchor.frontier) ||
        anchor.index < 0 || anchor.index > anchor.frontier || anchor.frontier >= this.beats.length ||
        this.beats[anchor.index].id !== anchor.beatId ||
        this.beats[anchor.frontier].id !== anchor.frontierBeatId ||
        !Number.isInteger(anchor.eventCount) || anchor.eventCount < 0 ||
        !validProgress(anchor.progress)) return false;
    const replay = new StoryController({ beats: this.beats, onChange() {}, reducedMotion: this.reducedMotion, version: this.version });
    replay.runId = anchor.runId;
    for (let index = 1; index <= anchor.frontier; index += 1) {
      if (!replay.enter(index)) return false;
    }
    if (replay.eventLedger.size !== anchor.eventCount || !replay.restore(anchor, { silent: true })) return false;
    this.runId = replay.runId;
    this.index = replay.index;
    this.frontier = replay.frontier;
    this.liveWork = copy(replay.liveWork);
    this.eventLedger = new Set(replay.eventLedger);
    this.checkpoints = new Map([...replay.checkpoints].map(([index, checkpoint]) => [index, copy(checkpoint)]));
    this.views = new Map([...replay.views].map(([index, view]) => [index, copy(view)]));
    this.inspectedNode = replay.inspectedNode;
    this.diagnostic = null;
    this.emit({ restore: true, transferred: true, enter: true });
    return true;
  }

  restart() {
    if (this.paused) return false;
    this.startNewRun();
    this.emit({ restart: true, enter: true, firstVisit: true });
    return true;
  }
}
