const NODE_STATES = new Set([
  'pending',
  'active',
  'passed',
  'failed',
  'complete',
  'invalidated'
]);

const EDGE_KINDS = new Set([undefined, 'rollback', 'success']);
const COMMAND_TYPES = new Set(['enter', 'complete', 'fork', 'result', 'join', 'rollback']);

export class StoryValidationError extends Error {
  constructor(message) {
    super(message);
    this.name = 'StoryValidationError';
  }
}

function fail(message) {
  throw new StoryValidationError(message);
}

function stepFail(stepId, message) {
  fail(`Step "${stepId}": ${message}`);
}

function nonempty(value) {
  return typeof value === 'string' && value.trim().length > 0;
}

function clone(value) {
  return structuredClone(value);
}

function deepFreeze(value, seen = new WeakSet()) {
  if (value === null || typeof value !== 'object' || seen.has(value)) return value;
  seen.add(value);
  for (const child of Reflect.ownKeys(value)) deepFreeze(value[child], seen);
  return Object.freeze(value);
}

function validateGraph(graph) {
  if (!graph || !Array.isArray(graph.nodes) || !Array.isArray(graph.edges)) {
    fail('Graph must contain nodes and edges arrays');
  }
  if (graph.nodes.length === 0) fail('Graph must contain at least one node');

  const nodeIds = new Set();
  for (const [index, node] of graph.nodes.entries()) {
    if (!node || !nonempty(node.id)) fail(`Graph node ${index} must have a nonempty id`);
    if (!nonempty(node.label)) fail(`Graph node "${node.id}" must have a nonempty label`);
    if (nodeIds.has(node.id)) fail(`Graph has duplicate node id "${node.id}"`);
    nodeIds.add(node.id);
  }

  const edgeKeys = new Set();
  for (const [index, edge] of graph.edges.entries()) {
    if (!edge || !nonempty(edge.from) || !nonempty(edge.to)) {
      fail(`Graph edge ${index} must have nonempty from and to node ids`);
    }
    if (!nodeIds.has(edge.from) || !nodeIds.has(edge.to)) {
      fail(`Graph edge ${index} references an unknown node: ${edge.from} -> ${edge.to}`);
    }
    if (!EDGE_KINDS.has(edge.kind)) {
      fail(`Graph edge ${index} has unsupported kind "${edge.kind}"`);
    }
    const key = `${edge.from}\u0000${edge.to}`;
    if (edgeKeys.has(key)) fail(`Graph has duplicate edge ${edge.from} -> ${edge.to}`);
    edgeKeys.add(key);
  }

  const forkSchemaProvided = graph.forks !== undefined;
  if (forkSchemaProvided && !Array.isArray(graph.forks)) fail('Graph forks must be an array when provided');
  const forkBySource = new Map();
  const joinNodeIds = new Set();
  for (const [index, fork] of (graph.forks ?? []).entries()) {
    if (!fork || !nodeIds.has(fork.sourceNodeId) || !nodeIds.has(fork.joinNodeId)) {
      fail(`Graph fork ${index} must reference known sourceNodeId and joinNodeId values`);
    }
    if (forkBySource.has(fork.sourceNodeId)) {
      fail(`Graph has duplicate fork definition for source node "${fork.sourceNodeId}"`);
    }
    if (!Array.isArray(fork.branches) || fork.branches.length === 0) {
      fail(`Graph fork from "${fork.sourceNodeId}" must declare at least one branch`);
    }
    if (fork.requiresPass !== undefined && typeof fork.requiresPass !== 'boolean') {
      fail(`Graph fork from "${fork.sourceNodeId}" requiresPass must be true or false`);
    }
    const branches = new Map();
    for (const [branchIndex, branch] of fork.branches.entries()) {
      if (!branch || !nodeIds.has(branch.nodeId)) {
        fail(`Graph fork from "${fork.sourceNodeId}" branch ${branchIndex} references an unknown node`);
      }
      if (branches.has(branch.nodeId)) {
        fail(`Graph fork from "${fork.sourceNodeId}" repeats branch node "${branch.nodeId}"`);
      }
      if (typeof branch.required !== 'boolean') {
        fail(`Graph fork branch "${branch.nodeId}" must declare required as true or false`);
      }
      if (!edgeFromTo(graph.edges, fork.sourceNodeId, branch.nodeId, (edge) => edge.kind !== 'rollback')) {
        fail(`Graph fork has no edge from "${fork.sourceNodeId}" to branch "${branch.nodeId}"`);
      }
      if (!edgeFromTo(graph.edges, branch.nodeId, fork.joinNodeId, (edge) => edge.kind !== 'rollback')) {
        fail(`Graph fork branch "${branch.nodeId}" has no edge to join "${fork.joinNodeId}"`);
      }
      branches.set(branch.nodeId, branch.required);
    }
    forkBySource.set(fork.sourceNodeId, {
      sourceNodeId: fork.sourceNodeId,
      joinNodeId: fork.joinNodeId,
      requiresPass: fork.requiresPass === true,
      branches
    });
    joinNodeIds.add(fork.joinNodeId);
  }

  return {
    nodeIds,
    firstNodeId: graph.nodes[0].id,
    forkSchemaProvided,
    forkBySource,
    joinNodeIds
  };
}

function normalizeScenario({ turns, steps }, nodeIds) {
  if (turns !== undefined && steps !== undefined) {
    fail('Scenario must provide either turns or legacy steps, not both');
  }

  if (steps !== undefined) {
    if (!Array.isArray(steps) || steps.length === 0) fail('Steps must be a nonempty array');
    const stepIds = new Set();
    return steps.map((step, index) => {
      const fallbackId = `#${index + 1}`;
      if (!step || !nonempty(step.id)) fail(`Step ${fallbackId}: id must be nonempty`);
      if (stepIds.has(step.id)) stepFail(step.id, 'duplicate step id');
      stepIds.add(step.id);
      if (!nodeIds.has(step.nodeId)) stepFail(step.id, `unknown node "${step.nodeId}"`);
      if (!nonempty(step.human) || !nonempty(step.ai)) {
        stepFail(step.id, 'human and ai dialogue must both be nonempty');
      }
      if (!step.command || !COMMAND_TYPES.has(step.command.type)) {
        stepFail(step.id, `unsupported command type "${step.command?.type}"`);
      }
      if (step.scenes !== undefined && !Array.isArray(step.scenes)) {
        stepFail(step.id, 'scenes must be an array when provided');
      }
      return {
        id: step.id,
        human: step.human,
        ai: step.ai,
        scenes: clone(step.scenes ?? []),
        segments: [{
          id: step.id,
          nodeId: step.nodeId,
          text: step.ai,
          command: clone(step.command),
          frameIndex: index
        }]
      };
    });
  }

  if (!Array.isArray(turns) || turns.length === 0) fail('Turns must be a nonempty array');
  const turnIds = new Set();
  const segmentIds = new Set();
  let frameIndex = 0;
  return turns.map((turn, turnIndex) => {
    const fallbackId = `#${turnIndex + 1}`;
    if (!turn || !nonempty(turn.id)) fail(`Turn ${fallbackId}: id must be nonempty`);
    if (turnIds.has(turn.id)) fail(`Turn "${turn.id}": duplicate turn id`);
    turnIds.add(turn.id);
    if (!nonempty(turn.human)) fail(`Turn "${turn.id}": human dialogue must be nonempty`);
    if (!Array.isArray(turn.segments) || turn.segments.length === 0) {
      fail(`Turn "${turn.id}": segments must be a nonempty array`);
    }
    if (turn.scenes !== undefined && !Array.isArray(turn.scenes)) {
      fail(`Turn "${turn.id}": scenes must be an array when provided`);
    }

    const normalizedSegments = turn.segments.map((segment, segmentIndex) => {
      const fallbackSegmentId = `#${segmentIndex + 1}`;
      if (!segment || !nonempty(segment.id)) {
        fail(`Turn "${turn.id}" segment ${fallbackSegmentId}: id must be nonempty`);
      }
      if (segmentIds.has(segment.id)) {
        fail(`Turn "${turn.id}" segment "${segment.id}": duplicate segment id`);
      }
      segmentIds.add(segment.id);
      if (!nodeIds.has(segment.nodeId)) {
        fail(`Turn "${turn.id}" segment "${segment.id}": unknown node "${segment.nodeId}"`);
      }
      if (!nonempty(segment.text)) {
        fail(`Turn "${turn.id}" segment "${segment.id}": text must be nonempty`);
      }
      if (!segment.command || !COMMAND_TYPES.has(segment.command.type)) {
        fail(`Turn "${turn.id}" segment "${segment.id}": unsupported command type "${segment.command?.type}"`);
      }
      return {
        id: segment.id,
        nodeId: segment.nodeId,
        text: segment.text,
        command: clone(segment.command),
        frameIndex: frameIndex++
      };
    });

    return {
      id: turn.id,
      human: turn.human,
      ai: normalizedSegments.map((segment) => segment.text).join(' '),
      scenes: clone(turn.scenes ?? []),
      segments: normalizedSegments
    };
  });
}

function edgeFromTo(edges, from, to, predicate = () => true) {
  return edges.find((edge) => edge.from === from && edge.to === to && predicate(edge));
}

function forwardReachableNodeIds(edges, startNodeId) {
  const reachable = new Set([startNodeId]);
  const queue = [startNodeId];
  for (let index = 0; index < queue.length; index += 1) {
    const current = queue[index];
    for (const edge of edges) {
      if (edge.kind === 'rollback' || edge.from !== current || reachable.has(edge.to)) continue;
      reachable.add(edge.to);
      queue.push(edge.to);
    }
  }
  return reachable;
}

function snapshot(state) {
  return {
    revision: state.revision,
    activeNodes: [...state.activeNodes],
    focusNodeId: state.focusNodeId,
    visits: clone(state.visits),
    branches: clone(state.branches),
    evidence: clone(state.evidence),
    archivedEvidence: clone(state.archivedEvidence),
    nodeStates: { ...state.nodeStates }
  };
}

function assertNodeStateValues(stepId, nodeStates) {
  for (const [nodeId, value] of Object.entries(nodeStates)) {
    if (!NODE_STATES.has(value)) stepFail(stepId, `invalid state "${value}" for node "${nodeId}"`);
  }
}

/**
 * Compile an authored scenario into deterministic, immutable scroll checkpoints.
 * This function performs no I/O and retains no state between calls.
 */
export function compileScenario({ graph, turns, steps } = {}) {
  const graphCopy = clone(graph);
  const turnsCopy = clone(turns);
  const stepsCopy = clone(steps);
  const {
    nodeIds,
    firstNodeId,
    forkSchemaProvided,
    forkBySource,
    joinNodeIds
  } = validateGraph(graphCopy);
  const normalizedTurns = normalizeScenario({ turns: turnsCopy, steps: stepsCopy }, nodeIds);
  const executionSteps = normalizedTurns.flatMap((turn) => turn.segments.map((segment) => ({
    id: segment.id,
    nodeId: segment.nodeId,
    human: turn.human,
    ai: segment.text,
    command: segment.command,
    scenes: turn.scenes,
    turnId: turn.id,
    segmentId: segment.id
  })));

  const edges = graphCopy.edges;
  const state = {
    revision: 1,
    activeNodes: [],
    focusNodeId: null,
    visits: [],
    branches: [],
    evidence: [],
    archivedEvidence: [],
    nodeStates: Object.fromEntries(graphCopy.nodes.map((node) => [node.id, 'pending']))
  };
  const frames = [];
  const ordinals = new Map();
  const currentVisitByNode = new Map();
  const dialoguedVisitIds = new Set();
  const evidenceIds = new Set();
  const forkKeys = new Set();
  let activeFork = null;

  function createVisit(nodeId, fields = {}) {
    const ordinal = (ordinals.get(nodeId) ?? 0) + 1;
    ordinals.set(nodeId, ordinal);
    const visit = {
      id: `visit-${String(state.visits.length + 1).padStart(3, '0')}`,
      nodeId,
      ordinal,
      revision: state.revision,
      ...fields
    };
    state.visits.push(visit);
    currentVisitByNode.set(nodeId, visit.id);
    return visit;
  }

  function completeActiveNodes() {
    for (const nodeId of state.activeNodes) {
      if (state.nodeStates[nodeId] === 'active') state.nodeStates[nodeId] = 'complete';
    }
  }

  function requireStepNode(step, expected, commandName) {
    if (step.nodeId !== expected) {
      stepFail(step.id, `${commandName} dialogue must use node "${expected}", got "${step.nodeId}"`);
    }
  }

  function currentJoinedFork() {
    if (!activeFork || !activeFork.joined || activeFork.revision !== state.revision) return null;
    return activeFork;
  }

  for (const step of executionSteps) {
    const before = snapshot(state);
    const command = step.command;
    let frameVisitId;

    if (command.type === 'enter') {
      if (!nodeIds.has(command.nodeId)) stepFail(step.id, `enter references unknown node "${command.nodeId}"`);
      requireStepNode(step, command.nodeId, 'enter');
      if (joinNodeIds.has(command.nodeId)) {
        stepFail(step.id, `configured join node "${command.nodeId}" must be entered with join`);
      }
      const configuredSource = forkBySource.get(state.focusNodeId);
      if (configuredSource?.branches.has(command.nodeId)) {
        stepFail(step.id, `configured branch "${command.nodeId}" must be entered with fork`);
      }
      if (activeFork && !activeFork.joined) {
        stepFail(step.id, `cannot enter "${command.nodeId}" before fork "${activeFork.forkId}" is joined`);
      }
      if (state.focusNodeId === null) {
        if (state.activeNodes.length !== 0 || command.nodeId !== firstNodeId) {
          stepFail(step.id, `the first enter must target graph node "${firstNodeId}"`);
        }
      } else {
        const edge = edgeFromTo(edges, state.focusNodeId, command.nodeId, (candidate) => candidate.kind !== 'rollback');
        if (!edge) stepFail(step.id, `no enter edge from "${state.focusNodeId}" to "${command.nodeId}"`);
        const joined = currentJoinedFork();
        if (
          joined
          && state.focusNodeId === joined.joinNodeId
          && joined.branches.some((branch) => branch.required && branch.status === 'fail')
          && edge.kind !== 'success'
        ) {
          stepFail(step.id, `failed fork "${joined.forkId}" must leave its join by rollback; an ordinary edge is not allowed`);
        }
        if (edge.kind === 'success') {
          if (!joined || joined.branches.filter((branch) => branch.required).some((branch) => branch.status !== 'pass')) {
            stepFail(step.id, `success edge to "${command.nodeId}" requires a joined current-revision fork whose required branches passed`);
          }
        }
      }
      completeActiveNodes();
      const visit = createVisit(command.nodeId);
      state.activeNodes = [command.nodeId];
      state.focusNodeId = command.nodeId;
      state.nodeStates[command.nodeId] = 'active';
      frameVisitId = visit.id;
    } else if (command.type === 'complete') {
      if (!nodeIds.has(command.nodeId)) stepFail(step.id, `complete references unknown node "${command.nodeId}"`);
      requireStepNode(step, command.nodeId, 'complete');
      if (command.outcome !== 'pass' && command.outcome !== 'fail') {
        stepFail(step.id, 'complete outcome must be "pass" or "fail"');
      }
      if (!command.evidence || !nonempty(command.evidence.id) || !nonempty(command.evidence.summary)) {
        stepFail(step.id, 'complete evidence must have nonempty id and summary');
      }
      if (evidenceIds.has(command.evidence.id)) stepFail(step.id, `duplicate evidence id "${command.evidence.id}"`);
      if (state.focusNodeId !== command.nodeId) {
        stepFail(step.id, `complete targets stale or inactive node "${command.nodeId}"`);
      }
      const visitId = currentVisitByNode.get(command.nodeId);
      const visit = state.visits.find((candidate) => candidate.id === visitId);
      if (!visit || visit.revision !== state.revision || !state.activeNodes.includes(command.nodeId)) {
        stepFail(step.id, `complete targets stale or inactive visit for node "${command.nodeId}"`);
      }
      if (state.evidence.some((item) => item.nodeId === command.nodeId && item.visitId === visitId)) {
        stepFail(step.id, `node "${command.nodeId}" already has a result for visit "${visitId}"`);
      }

      evidenceIds.add(command.evidence.id);
      state.nodeStates[command.nodeId] = command.outcome === 'pass' ? 'passed' : 'failed';
      state.evidence.push({
        id: command.evidence.id,
        summary: command.evidence.summary,
        revision: state.revision,
        nodeId: command.nodeId,
        visitId,
        outcome: command.outcome
      });
      frameVisitId = visitId;
    } else if (command.type === 'fork') {
      if (!nonempty(command.forkId)) stepFail(step.id, 'forkId must be nonempty');
      if (!Array.isArray(command.branches) || command.branches.length === 0) {
        stepFail(step.id, 'fork must contain at least one branch');
      }
      if (activeFork && !activeFork.joined) {
        stepFail(step.id, `fork "${activeFork.forkId}" is already running`);
      }
      const forkKey = `${state.revision}\u0000${command.forkId}`;
      if (forkKeys.has(forkKey)) {
        stepFail(step.id, `duplicate fork id "${command.forkId}" in revision ${state.revision}`);
      }
      forkKeys.add(forkKey);
      if (state.focusNodeId === null) stepFail(step.id, 'fork requires a focused source node');
      requireStepNode(step, state.focusNodeId, 'fork');
      const sourceVisitId = currentVisitByNode.get(state.focusNodeId);
      if (!sourceVisitId) stepFail(step.id, `focused node "${state.focusNodeId}" has no visit`);

      const declaredFork = forkBySource.get(state.focusNodeId);
      if (forkSchemaProvided && !declaredFork) {
        stepFail(step.id, `graph has no fork definition for source node "${state.focusNodeId}"`);
      }
      if (declaredFork?.requiresPass) {
        const passEvidence = state.evidence.some((item) => (
          item.nodeId === state.focusNodeId
          && item.visitId === sourceVisitId
          && item.revision === state.revision
          && item.outcome === 'pass'
        ));
        if (!passEvidence) {
          stepFail(step.id, `fork from "${state.focusNodeId}" requires pass evidence for its current visit and revision`);
        }
      }
      const branchIds = new Set();
      const branchNodeIds = new Set();
      for (const [index, branch] of command.branches.entries()) {
        if (!branch || !nonempty(branch.id)) stepFail(step.id, `branch ${index + 1} must have a nonempty id`);
        if (branchIds.has(branch.id)) stepFail(step.id, `duplicate branch id "${branch.id}"`);
        branchIds.add(branch.id);
        if (!nodeIds.has(branch.nodeId)) stepFail(step.id, `branch "${branch.id}" references unknown node "${branch.nodeId}"`);
        if (branchNodeIds.has(branch.nodeId)) stepFail(step.id, `multiple branches target node "${branch.nodeId}"`);
        branchNodeIds.add(branch.nodeId);
        if (typeof branch.required !== 'boolean') {
          stepFail(step.id, `branch "${branch.id}" must declare required as true or false`);
        }
        if (!edgeFromTo(edges, state.focusNodeId, branch.nodeId, (edge) => edge.kind !== 'rollback')) {
          stepFail(step.id, `no fork edge from "${state.focusNodeId}" to branch node "${branch.nodeId}"`);
        }
      }
      if (declaredFork) {
        if (command.branches.length !== declaredFork.branches.size) {
          stepFail(step.id, `fork branches must exactly match the graph definition for "${state.focusNodeId}"`);
        }
        for (const branch of command.branches) {
          if (!declaredFork.branches.has(branch.nodeId)) {
            stepFail(step.id, `branch node "${branch.nodeId}" is not declared by the graph fork`);
          }
          if (declaredFork.branches.get(branch.nodeId) !== branch.required) {
            stepFail(step.id, `branch "${branch.nodeId}" required flag does not match the graph fork`);
          }
        }
      }

      const nextBranches = [];
      for (const branch of command.branches) {
        const visit = createVisit(branch.nodeId, { branchId: branch.id, forkId: command.forkId });
        nextBranches.push({
          id: branch.id,
          nodeId: branch.nodeId,
          visitId: visit.id,
          forkId: command.forkId,
          revision: state.revision,
          required: branch.required,
          status: 'running'
        });
        state.nodeStates[branch.nodeId] = 'active';
      }
      completeActiveNodes();
      for (const branch of nextBranches) state.nodeStates[branch.nodeId] = 'active';
      state.activeNodes = nextBranches.map((branch) => branch.nodeId);
      state.branches = nextBranches;
      activeFork = {
        forkId: command.forkId,
        revision: state.revision,
        joined: false,
        sourceNodeId: state.focusNodeId,
        joinNodeId: declaredFork?.joinNodeId,
        branches: state.branches
      };
      frameVisitId = sourceVisitId;
    } else if (command.type === 'result') {
      if (!nonempty(command.forkId) || !nonempty(command.branchId)) {
        stepFail(step.id, 'result requires nonempty forkId and branchId');
      }
      if (!activeFork || activeFork.joined || activeFork.forkId !== command.forkId || activeFork.revision !== state.revision) {
        stepFail(step.id, `result targets stale or inactive fork "${command.forkId}"`);
      }
      const branch = state.branches.find((candidate) => candidate.id === command.branchId);
      if (!branch || branch.forkId !== command.forkId || branch.revision !== state.revision) {
        stepFail(step.id, `result targets stale or unknown branch "${command.branchId}"`);
      }
      if (branch.status !== 'running') stepFail(step.id, `branch "${command.branchId}" already has a result`);
      if (command.outcome !== 'pass' && command.outcome !== 'fail') {
        stepFail(step.id, 'result outcome must be "pass" or "fail"');
      }
      if (!command.evidence || !nonempty(command.evidence.id) || !nonempty(command.evidence.summary)) {
        stepFail(step.id, 'result evidence must have nonempty id and summary');
      }
      if (evidenceIds.has(command.evidence.id)) stepFail(step.id, `duplicate evidence id "${command.evidence.id}"`);
      requireStepNode(step, branch.nodeId, 'result');

      evidenceIds.add(command.evidence.id);
      branch.status = command.outcome;
      state.nodeStates[branch.nodeId] = command.outcome === 'pass' ? 'passed' : 'failed';
      state.activeNodes = state.branches
        .filter((candidate) => candidate.status === 'running')
        .map((candidate) => candidate.nodeId);
      state.focusNodeId = branch.nodeId;
      state.evidence.push({
        id: command.evidence.id,
        summary: command.evidence.summary,
        revision: state.revision,
        branchId: branch.id,
        forkId: branch.forkId,
        visitId: branch.visitId,
        outcome: command.outcome
      });
      frameVisitId = branch.visitId;
    } else if (command.type === 'join') {
      if (!nonempty(command.forkId) || !nodeIds.has(command.nodeId)) {
        stepFail(step.id, 'join requires a nonempty forkId and known nodeId');
      }
      requireStepNode(step, command.nodeId, 'join');
      if (!activeFork || activeFork.joined || activeFork.forkId !== command.forkId || activeFork.revision !== state.revision) {
        stepFail(step.id, `join targets stale or inactive fork "${command.forkId}"`);
      }
      if (activeFork.joinNodeId && command.nodeId !== activeFork.joinNodeId) {
        stepFail(step.id, `fork "${command.forkId}" must join at graph node "${activeFork.joinNodeId}"`);
      }
      const required = state.branches.filter((branch) => branch.required);
      if (required.some((branch) => branch.status === 'running')) {
        stepFail(step.id, `cannot join fork "${command.forkId}" while required branches are incomplete`);
      }
      for (const branch of state.branches) {
        if (!edgeFromTo(edges, branch.nodeId, command.nodeId, (edge) => edge.kind !== 'rollback')) {
          stepFail(step.id, `branch "${branch.id}" has no join edge to "${command.nodeId}"`);
        }
      }

      for (const branch of state.branches) {
        if (branch.status === 'running') state.nodeStates[branch.nodeId] = 'invalidated';
      }
      const visit = createVisit(command.nodeId);
      state.activeNodes = [command.nodeId];
      state.focusNodeId = command.nodeId;
      state.nodeStates[command.nodeId] = 'active';
      activeFork.joined = true;
      activeFork.joinNodeId = command.nodeId;
      activeFork.branches = state.branches;
      frameVisitId = visit.id;
    } else if (command.type === 'rollback') {
      if (!nodeIds.has(command.nodeId)) stepFail(step.id, `rollback references unknown node "${command.nodeId}"`);
      requireStepNode(step, command.nodeId, 'rollback');
      if (!nonempty(command.reason)) stepFail(step.id, 'rollback reason must be nonempty');
      if (!Array.isArray(command.invalidates)) stepFail(step.id, 'rollback invalidates must be an array');
      const explicitInvalidates = new Set();
      for (const nodeId of command.invalidates) {
        if (!nodeIds.has(nodeId)) stepFail(step.id, `rollback invalidates unknown node "${nodeId}"`);
        if (explicitInvalidates.has(nodeId)) stepFail(step.id, `rollback invalidates node "${nodeId}" more than once`);
        explicitInvalidates.add(nodeId);
      }
      const failedJoin = currentJoinedFork();
      if (!failedJoin || !failedJoin.branches.some((branch) => branch.required && branch.status === 'fail')) {
        stepFail(step.id, 'rollback requires the active joined current-revision fork to have a failed required branch');
      }
      if (state.focusNodeId === null || !edgeFromTo(edges, state.focusNodeId, command.nodeId, (edge) => edge.kind === 'rollback')) {
        stepFail(step.id, `no rollback edge from "${state.focusNodeId}" to "${command.nodeId}"`);
      }

      const invalidates = forwardReachableNodeIds(edges, command.nodeId);
      for (const nodeId of explicitInvalidates) invalidates.add(nodeId);

      completeActiveNodes();
      state.archivedEvidence.push(...state.evidence.map((evidence) => clone(evidence)));
      state.evidence = [];
      state.branches = [];
      activeFork = null;
      state.revision += 1;
      for (const nodeId of invalidates) state.nodeStates[nodeId] = 'invalidated';
      const visit = createVisit(command.nodeId, { reason: command.reason });
      state.activeNodes = [command.nodeId];
      state.focusNodeId = command.nodeId;
      state.nodeStates[command.nodeId] = 'active';
      frameVisitId = visit.id;
    }

    if (!frameVisitId) stepFail(step.id, 'command did not resolve to a visit');
    dialoguedVisitIds.add(frameVisitId);
    assertNodeStateValues(step.id, state.nodeStates);
    frames.push({
      id: step.id,
      step,
      before,
      after: snapshot(state),
      visitId: frameVisitId,
      turnId: step.turnId,
      segmentId: step.segmentId
    });
  }

  const silentVisits = state.visits.filter((visit) => !dialoguedVisitIds.has(visit.id));
  if (silentVisits.length > 0) {
    const detail = silentVisits.map((visit) => `${visit.id} (${visit.nodeId})`).join(', ');
    stepFail(executionSteps.at(-1).id, `every visit needs dialogue; missing branch result dialogue for ${detail}`);
  }

  return deepFreeze({ turns: normalizedTurns, frames, visits: clone(state.visits) });
}
