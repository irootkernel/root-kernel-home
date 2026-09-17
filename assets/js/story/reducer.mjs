export const initialWorkState = () => ({
  phase: 'scope', attempt: 1, revision: 1, specValid: false,
  scopeApprovalRevision: null, finalApprovalRevision: null,
  lanes: {}, archivedEvidence: []
});

const clone = (state) => structuredClone(state);
const rejected = (state, reason) => ({ accepted: false, reason, before: state, after: state });
const accepted = (before, after) => ({ accepted: true, reason: null, before, after });

export function reduceWork(state, event) {
  const before = state;
  const next = clone(state);
  switch (event.type) {
    case 'DEFINE_SCOPE':
      if (state.phase !== 'scope') return rejected(state, 'WRONG_SOURCE');
      next.phase = 'spec';
      return accepted(before, next);
    case 'SUBMIT_SPEC':
      if (state.phase !== 'spec') return rejected(state, 'WRONG_SOURCE');
      next.phase = 'spec_check';
      next.specValid = false;
      return accepted(before, next);
    case 'CHECK_SPEC':
      if (state.phase !== 'spec_check') return rejected(state, 'WRONG_SOURCE');
      next.specValid = event.outcome === 'pass';
      return accepted(before, next);
    case 'LOAD_SCOPE_APPROVAL_FIXTURE': {
      if (state.phase !== 'spec_check') return rejected(state, 'WRONG_SOURCE');
      const expected = `demo-scope-r${state.revision}`;
      if (event.fixture_id !== expected || event.revision !== state.revision) return rejected(state, 'INVALID_FIXTURE');
      next.scopeApprovalRevision = state.revision;
      return accepted(before, next);
    }
    case 'START_BUILD':
      if (state.phase !== 'spec_check') return rejected(state, 'WRONG_SOURCE');
      if (!state.specValid || state.scopeApprovalRevision !== state.revision) return rejected(state, 'SCOPE_NOT_APPROVED');
      next.phase = 'build';
      return accepted(before, next);
    case 'FORK_CHECKS':
      if (state.phase !== 'build') return rejected(state, 'WRONG_SOURCE');
      next.phase = 'parallel';
      next.lanes = Object.fromEntries(['tests', 'review', 'records'].map(lane => [lane, { revision: state.revision, outcome: 'running' }]));
      return accepted(before, next);
    case 'COMPLETE_LANE': {
      if (state.phase !== 'parallel') return rejected(state, 'WRONG_SOURCE');
      if (!['tests', 'review', 'records'].includes(event.lane)) return rejected(state, 'UNKNOWN_LANE');
      const lane = state.lanes[event.lane];
      if (!lane || lane.revision !== state.revision || event.revision !== state.revision) return rejected(state, 'STALE_EVIDENCE');
      if (lane.outcome !== 'running') return rejected(state, 'LANE_ALREADY_TERMINAL');
      if (!['pass', 'fail'].includes(event.outcome)) return rejected(state, 'INVALID_OUTCOME');
      next.lanes[event.lane] = { revision: state.revision, outcome: event.outcome };
      return accepted(before, next);
    }
    case 'JOIN_CHECKS': {
      if (state.phase !== 'parallel') return rejected(state, 'WRONG_SOURCE');
      const lanes = ['tests', 'review', 'records'].map(name => state.lanes[name]);
      if (lanes.some(lane => !lane || lane.revision !== state.revision || lane.outcome === 'running')) return rejected(state, 'LANES_INCOMPLETE');
      next.phase = 'result_check';
      return accepted(before, next);
    }
    case 'REQUEST_HUMAN_DECISION': {
      if (state.phase !== 'result_check') return rejected(state, 'WRONG_SOURCE');
      const lanes = ['tests', 'review', 'records'].map(name => state.lanes[name]);
      if (lanes.some(lane => !lane || lane.revision !== state.revision || lane.outcome !== 'pass')) return rejected(state, 'EVIDENCE_FAILED');
      next.phase = 'human_decision';
      return accepted(before, next);
    }
    case 'REWORK': {
      if (state.phase !== 'result_check' || state.attempt !== 1 || state.revision !== 1) return rejected(state, 'REWORK_NOT_ALLOWED');
      if (!Object.values(state.lanes).some(lane => lane.outcome === 'fail')) return rejected(state, 'REWORK_NOT_REQUIRED');
      next.archivedEvidence.push({ revision: 1, lanes: clone(state.lanes) });
      next.attempt = 2;
      next.revision = 2;
      next.phase = 'spec';
      next.specValid = false;
      next.scopeApprovalRevision = null;
      next.finalApprovalRevision = null;
      next.lanes = {};
      return accepted(before, next);
    }
    case 'LOAD_FINAL_APPROVAL_FIXTURE':
      if (state.phase !== 'human_decision') return rejected(state, 'WRONG_SOURCE');
      if (event.fixture_id !== 'demo-final-r2' || event.revision !== 2 || state.revision !== 2) return rejected(state, 'INVALID_FIXTURE');
      next.finalApprovalRevision = 2;
      return accepted(before, next);
    case 'CLOSE_EXAMPLE': {
      if (state.phase !== 'human_decision') return rejected(state, 'WRONG_SOURCE');
      const passing = ['tests', 'review', 'records'].every(name => state.lanes[name]?.revision === 2 && state.lanes[name]?.outcome === 'pass');
      if (!passing || state.finalApprovalRevision !== 2) return rejected(state, 'FINAL_NOT_APPROVED');
      next.phase = 'done';
      return accepted(before, next);
    }
    default:
      return rejected(state, 'UNKNOWN_EVENT');
  }
}

export function buildCheckpoints(beats, runId = 'homepage-demo') {
  let state = initialWorkState();
  const delivered = new Set();
  return beats.map(beat => {
    let rejection = null;
    const trace = [];
    beat.events.forEach((event, ordinal) => {
      const key = `${runId}:${beat.id}:${ordinal}`;
      if (delivered.has(key)) return;
      delivered.add(key);
      const result = reduceWork(state, event);
      trace.push({ key, type: event.type, accepted: result.accepted, reason: result.reason });
      if (result.accepted) state = result.after;
      else rejection = result.reason;
    });
    return { beatId: beat.id, work: clone(state), rejection, trace };
  });
}

export function nodeStatuses(checkpoint) {
  const { work, rejection } = checkpoint;
  const status = Object.fromEntries(Array.from({ length: 10 }, (_, index) => [`W${String(index + 1).padStart(2, '0')}`, 'future']));
  const completedThrough = { scope: 0, spec: 1, spec_check: 2, build: 3, parallel: 4, result_check: 7, human_decision: 8, done: 10 }[work.phase];
  for (let i = 0; i < completedThrough; i += 1) status[`W${String(i + 1).padStart(2, '0')}`] = 'complete';
  if (work.phase === 'parallel') {
    status.W04 = 'complete';
    for (const [lane, node] of Object.entries({ tests: 'W05', review: 'W06', records: 'W07' })) status[node] = work.lanes[lane]?.outcome || 'running';
  } else {
    const active = { scope: 'W01', spec: 'W02', spec_check: 'W03', build: 'W04', result_check: 'W08', human_decision: 'W09' }[work.phase];
    if (active) status[active] = 'active';
  }
  if (work.lanes && Object.keys(work.lanes).length) {
    for (const [lane, node] of Object.entries({ tests: 'W05', review: 'W06', records: 'W07' })) {
      if (work.lanes[lane]?.revision === work.revision && work.lanes[lane]?.outcome !== 'running') status[node] = work.lanes[lane].outcome;
    }
  }
  if (work.revision === 2 && ['spec', 'spec_check', 'build', 'parallel'].includes(work.phase)) {
    for (const node of ['W03', 'W04', 'W05', 'W06', 'W07', 'W08']) if (status[node] === 'future') status[node] = 'invalid';
  }
  if (rejection === 'EVIDENCE_FAILED') status.W09 = 'blocked';
  return status;
}
