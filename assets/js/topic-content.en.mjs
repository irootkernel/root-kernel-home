export const technologyText = {
  spark: {
    label: 'AI-SPARK',
    human: 'What kind of technology is AI-SPARK?',
    ai: 'AI-SPARK validates the specifications needed for server development, then has AI write code from specifications approved by a person. The FSM runtime controls the actual state transitions.',
    title: 'AI writes code from<br>approved specifications.',
    lead: 'Interfaces, state models, connection rules, and authorization policies are kept together as a versioned spec bundle.',
    bundle: ['Interfaces', 'State models', 'Connection rules', 'Authorization policies'],
    flow: ['Specification version', 'Validation', 'Human approval', 'Implementation'],
    explanation: 'Validation results, approval records, implementation, and deployment all refer to the same specification version. The FSM runtime changes state according to the declared rules and records each transition.',
    sourceLabel: 'AI-SPARK technical documentation ↗',
  },
  podway: {
    label: 'Podway',
    human: 'What does Podway do?',
    ai: 'Podway records work procedures and progress. Even when a new conversation starts or another agent takes over, you can see the current stage and the actions available next. If rework is needed, the task returns along a predefined path.',
    title: 'See the current stage<br>and what comes next.',
    lead: 'Define the procedure, the conditions for each stage, and the paths for rework before the task begins.',
    flow: ['Design', 'Implementation', 'Testing', 'Review'],
    returnText: '↶ If a problem is found, return to implementation and correct it',
    explanation: 'When work returns to an earlier stage, Podway manages whether existing records remain valid and identifies the work and checks that must run again.',
    homeLink: 'See the implementation correction on Home ↗',
  },
  aquarium: {
    label: 'Aquarium',
    human: 'How do I use AI-SPARK and Podway?',
    ai: 'AI-SPARK is patented technology, so this site presents an overview. Podway is open source and available through Aquarium. Aquarium is a plugin that checks the development environment, prepares the tools, and connects them. It also includes Dolgorae, Gaori, Mulgae, Sanho, and Sorage.',
    title: 'Prepare development tools<br>and use them together.',
    lead: 'Aquarium is built for Codex, with editions for Claude Code, GLM, and Grok.',
    toolRoles: ['Procedure', 'Agents', 'Testing', 'Review', 'Documents', 'Handoff'],
  },
  dolgorae: {
    label: 'Dolgorae',
    human: 'What does Dolgorae do in Aquarium? I think it might be related to Podway too.',
    ai: 'Podway manages the work procedure, the current stage, and the conditions for moving forward. Dolgorae defines the roles and permissions of Codex agents working on the same project, then manages their execution and collaboration. Aquarium connects these tools so the agents work within the defined procedure.',
    title: 'Connect the work procedure<br>to agent roles.',
    lead: 'Podway manages stages and conditions. Dolgorae manages the execution and collaboration of the agents assigned to the work.',
    roles: [
      ['Design', 'Structure and change scope'],
      ['Implementation', 'Feature development'],
      ['Review', 'Code and result checks'],
    ],
    explanation: 'Dolgorae is a higher control layer that gives Codex agents roles, permissions, behavior rules, and personas. Multiple agents work on their assigned tasks in one working directory and exchange the information they need.',
  },
  checks: {
    label: 'Gaori · Mulgae',
    human: 'Does Aquarium also include tools that help review the result?',
    ai: 'Yes. Mulgae pins the same code snapshot and gathers reports from multiple AI reviewers working independently. Gaori runs tests and helps you inspect the actual exit codes and logs. You can examine review feedback alongside execution results.',
    title: 'Check test results<br>and review evidence.',
    lead: 'Compare an agent\'s completion report with the actual result.',
    gaori: 'Gaori preserves the original output. It reports test success or failure from the actual exit code of the command that ran.',
    mulgae: 'Mulgae pins the code under review to a snapshot. It gathers independent reports from each AI and compares each finding with the code that was reviewed.',
  },
  documents: {
    label: 'Sanho · Sorage',
    human: 'Are there tools that help manage documentation too?',
    ai: 'Yes. Sanho synchronizes documentation from several code repositories with one canonical documentation repository. Sorage sends documents and review feedback between projects, supports revised versions moving back and forth, and records review progress and the final accepted document version.',
    title: 'Keep documentation aligned<br>and exchange review feedback.',
    lead: 'Edit documentation beside the code in each repository, then collect and manage the changes across repositories.',
    sanho: 'Sanho synchronizes documentation from several code repositories with one canonical documentation repository. It reconciles changes through Git merges, so conflicts can be resolved through the usual Git workflow.',
    sorage: 'Sorage sends documents and review feedback between AI sessions in different projects. It supports revised versions moving back and forth, and records review progress and the final accepted document version.',
  },
  atn: {
    label: 'ATN',
    human: 'So does Root Kernel use AI only for software development?',
    ai: 'We use AI for a range of work, including through Hermes Agent. We built ATN (Agent Turn Network) and use it so multiple Hermes agents can exchange views and debate. ATN also records the discussion between the moderator and participating agents, along with their conclusion.',
    title: 'Connect Hermes agents<br>so they can debate together.',
    lead: 'Root Kernel uses Hermes Agent across its work and built ATN for discussions between agents.',
    flow: ['Topic', 'Moderator · Participants', 'Discussion', 'Conclusion record'],
    control: 'ATN Control manages the discussion state and its records.',
    plugin: 'ATN Plugin connects Hermes agents so they can take part in the discussion.',
  },
  dispatch: {
    label: 'Agent Dispatch',
    human: 'LLM Wiki is practically essential when using Hermes. Is there a tool that helps with that too?',
    ai: 'Yes. We built Agent Dispatch to use LLM Wiki with Hermes Agent. It detects document changes, groups related work, and sends wiki update tasks to a Hermes agent according to configured rules. You can also check whether a task was dispatched and how it was handled.',
    title: 'Turn LLM Wiki updates<br>into Hermes tasks.',
    lead: 'Collect changed Markdown documents, send them to the agent that maintains the wiki, and check the result.',
    flow: ['Document change', 'Collect tasks', 'Dispatch to Hermes', 'Check result'],
    core: 'Agent Dispatch detects changes to Markdown documents and sends LLM Wiki update tasks to a Hermes agent according to configured rules. It batches repeated changes for processing.',
    plugin: 'Agent Dispatch Plugin connects Hermes conversations to path, work record, and result queries.',
  },
};

export const productConversationText = {
  doksuri: {
    human: 'I can see that you use AI actively. How do you work with AI in practice?',
    ai: 'We built Doksuri and use it with Hermes Agent. Doksuri is a project management tool where people and AI divide work on the same project, then share progress and results.',
  },
  sudal: {
    human: 'Doesn\'t that mean you end up talking only to AI?',
    ai: 'Relationships between people matter to Root Kernel too. That is why we are building Sudal, a live would-you-rather game where people answer questions together and start conversations. Players share their choices and the reasons behind them, which keeps the conversation moving naturally.',
  },
  ember: {
    human: 'What else are you building?',
    ai: 'We are also building Ember Quest, a physics puzzle RPG where you launch embers to light a dark maze. Choose the direction and force, use walls and reflectors, and light the brazier to open the door to the next floor.',
  },
};

export const productText = {
  sudal: {
    heading: 'A live would-you-rather game<br>that starts conversations',
    description: 'Sudal is a live would-you-rather game that helps friends, couples, and coworkers find things to talk about by answering questions together. Players choose their answers and explain why they made different choices, which keeps the conversation moving naturally.',
    alt: 'Concept image of people sharing their preferences while using Sudal',
    caption: 'Usage concept · Not an actual product screen.',
  },
  doksuri: {
    heading: 'A project management tool<br>where people and AI work together',
    description: 'Doksuri is a project management tool for collaboration between a small number of people and many AI agents. People and AI receive tasks in the same project, then share progress and results.',
    alt: 'Doksuri concept image showing people and AI collaborating around project documents',
    caption: 'Collaboration concept · Does not indicate whether a feature has been released.',
  },
  ember: {
    heading: 'A physics puzzle RPG<br>where embers open the way',
    description: 'Ember Quest is a vertical pixel art puzzle RPG where you launch embers to light a dark maze. Set the direction and force, use walls and reflectors, and light the brazier to open the door to the next floor.',
    alt: 'Ember Quest puzzle scene with an ember and obstacles',
    caption: 'Prototype concept · Not presented as footage from a released game.',
  },
};

export const sharedText = {
  github: 'GitHub ↗',
};
