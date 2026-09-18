export const technologyText = {
  spark: {
    label: 'AI-SPARK',
    human: 'What original technology has Root Kernel developed?',
    ai: 'Root Kernel builds technology that keeps AI working within defined boundaries and procedures. AI-SPARK first validates the specifications needed for server development, then has AI write code from specifications approved by a person.',
    title: 'AI writes code from<br>approved specifications.',
    lead: 'Server functions, state changes, connection rules, and authorization policies are managed together in one specification bundle.',
    bundle: ['Interfaces', 'State models', 'Connection rules', 'Authorization policies'],
    flow: ['Specification version', 'Validation', 'Human approval', 'Implementation'],
    explanation: 'Validation results, approval records, implementation, and deployment all refer to the same specification version. An FSM runtime controls and records actual state changes according to rules declared in advance.',
    sourceLabel: 'AI-SPARK technical documentation ↗',
    openSource: {
      label: 'Open-source directory',
      title: 'Open Source',
      lead: 'Open the repository for the Root Kernel tool you need. Start with Aquarium and Podway, or browse the public tools by purpose.',
      groups: {
        editions: 'Aquarium editions',
        coordination: 'Agent roles and coordination',
        verification: 'Testing and review',
        documents: 'Documents and handoff',
        agentOperations: 'Agent discussion and task dispatch',
      },
    },
  },
  podway: {
    label: 'Podway',
    human: 'Can that principle be used for work other than coding?',
    ai: 'Yes. Podway extends the principles behind AI-SPARK to other work with defined stages, such as analysis, documentation, and review. Once the procedure and its conditions are set, you can see the current stage and what comes next even when the conversation or assigned agent changes.',
    title: 'See the current stage<br>and what comes next.',
    lead: 'Define the conditions for each stage and the paths for rework across development and other kinds of work.',
    flow: ['Design', 'Implementation', 'Testing', 'Review'],
    returnText: '↶ If a problem is found, return to implementation and correct it',
    explanation: 'When work returns to an earlier stage, Podway manages whether existing records remain valid and identifies the work and checks that must run again.',
    homeLink: 'See the implementation correction on Home ↗',
  },
  aquarium: {
    label: 'Aquarium',
    human: 'Can I use these tools in my own development environment?',
    ai: 'Yes. Podway is open source and available through Aquarium, a plugin for Codex. Aquarium checks the development environment, prepares tools such as Podway, and connects them in one workflow. It also includes Dolgorae for assigning roles across AI agents, Gaori for test results, Mulgae for code review, and Sanho and Sorage for documentation.',
    title: 'Prepare development tools<br>and use them together.',
    lead: 'Aquarium is built for Codex, with editions for Claude Code, GLM, and Grok.',
    toolRoles: ['Procedure', 'Agents', 'Testing', 'Review', 'Documents', 'Handoff'],
  },
  dolgorae: {
    label: 'Dolgorae',
    human: 'How do you divide roles when several AI agents work together?',
    ai: 'Dolgorae assigns roles and permissions to Codex agents working on the same project, then manages their execution and collaboration. Podway defines the stages and the conditions for moving forward; Dolgorae determines who performs each stage and with what authority.',
    title: 'Connect the work procedure<br>to agent roles.',
    lead: 'Podway manages stages and conditions. Dolgorae manages the execution and collaboration of the agents assigned to the work.',
    roles: [
      ['Design', 'Structure and change scope'],
      ['Implementation', 'Feature development'],
      ['Review', 'Code and result checks'],
    ],
    explanation: 'Dolgorae is a control layer that gives Codex agents roles, permissions, behavior rules, and personas. It coordinates execution so multiple agents can carry out assigned work in the same workspace and exchange the information they need.',
  },
  checks: {
    label: 'Gaori · Mulgae',
    human: 'How do you check whether the AI actually finished the work correctly?',
    ai: 'Aquarium connects tools that check the result instead of relying only on a completion report. Gaori records the real success or failure of test commands and preserves their original logs. Mulgae pins the code under review to one snapshot and compares independent reviews from several AI agents with that exact code.',
    title: 'Check test results<br>and review evidence.',
    lead: 'Compare an agent\'s completion report with the actual result.',
    gaori: 'Gaori preserves the original output. It reports test success or failure from the actual exit code of the command that ran.',
    mulgae: 'Mulgae pins the code under review to a snapshot. It gathers independent reports from each AI and compares each finding with the code that was reviewed.',
  },
  documents: {
    label: 'Sanho · Sorage',
    human: 'How do you manage documentation when work is split across projects?',
    ai: 'Sanho keeps documentation spread across code repositories aligned with one canonical documentation repository. Sorage carries documents and review feedback between AI sessions in separate projects and lets them exchange revisions. It also records the review status and the final accepted document version.',
    title: 'Keep documentation aligned<br>and exchange review feedback.',
    lead: 'Edit documentation beside the code in each repository, then collect and manage the changes across repositories.',
    sanho: 'Sanho synchronizes documentation from several code repositories with one canonical documentation repository. It reconciles changes through Git merges, so conflicts can be resolved through the usual Git workflow.',
    sorage: 'Sorage sends documents and review feedback between AI sessions in different projects. It supports revised versions moving back and forth, and records review progress and the final accepted document version.',
  },
  atn: {
    label: 'ATN',
    human: 'Do you use AI for work beyond software development too?',
    ai: 'Yes. Root Kernel uses Hermes Agent for many kinds of work. To make better use of it, we built ATN (Agent Turn Network), where multiple Hermes agents can exchange views and debate. ATN also records the discussion between the moderator and participating agents, along with their conclusions.',
    title: 'Connect Hermes agents<br>so they can debate together.',
    lead: 'Root Kernel uses Hermes Agent across its work and built ATN for discussions between agents.',
    flow: ['Topic', 'Moderator · Participants', 'Discussion', 'Conclusion record'],
    control: 'ATN Control manages the discussion state and its records.',
    plugin: 'ATN Plugin connects Hermes agents so they can take part in the discussion.',
  },
  dispatch: {
    label: 'Agent Dispatch',
    human: 'To use AI that way, you must also keep its reference material up to date, right?',
    ai: 'Exactly. Root Kernel uses an LLM Wiki to organize the knowledge Hermes Agent needs for its work. We built Agent Dispatch to help keep that wiki current. It detects document changes, groups related work, and sends update tasks to Hermes agents according to configured rules, while keeping the results available for inspection.',
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
    caption: 'Concept illustration showing the product direction. Actual product screens are not public.',
  },
  doksuri: {
    heading: 'A project management tool<br>where people and AI work together',
    description: 'Doksuri is a project management tool for collaboration between a small number of people and many AI agents. People and AI receive tasks in the same project, then share progress and results.',
    alt: 'Doksuri concept image showing people and AI collaborating around project documents',
    caption: 'Concept illustration showing the product direction. Actual product screens are not public.',
  },
  ember: {
    heading: 'A physics puzzle RPG<br>where embers open the way',
    description: 'Ember Quest is a vertical pixel art puzzle RPG where you launch embers to light a dark maze. Set the direction and force, use walls and reflectors, and light the brazier to open the door to the next floor.',
    alt: 'Ember Quest puzzle scene with an ember and obstacles',
    caption: 'Concept illustration showing the product direction. Actual product screens are not public.',
  },
};

export const sharedText = {
  github: 'GitHub ↗',
};
