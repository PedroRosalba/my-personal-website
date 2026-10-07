// Single source of truth for the Claude Code skills Pedro builds.
// Drives: /skills page, its metadata and JSON-LD, the sitemap entry.
// Only true, published facts belong here.

export type Skill = {
  slug: string;
  title: string;
  summary: string;
  kind: "Entry point" | "Companion skill";
  highlights: string[];
  /** Example commands, shown verbatim. Empty for model-invoked skills. */
  invoke: string[];
  links: { label: string; href: string }[];
};

export const skillsRepo = "https://github.com/PedroRosalba/rosalbito";

// Matches the install block of the plugin README.
export const skillsInstall: string[] = [
  "/plugin marketplace add PedroRosalba/rosalbito",
  "/plugin install rosalbito@rosalbito",
];

/** Everything the /skills route says about itself: metadata, page copy, nav, teaser, sitemap. */
export const skillsPage = {
  path: "/skills",
  label: "Skills",
  title: "Skills",
  description:
    "The Claude Code skills Pedro Rosalba builds and uses on his own repositories: Rosalbito, one command for every engineering task, and its companion skills.",
  eyebrow: "Claude Code skills",
  heading: "Tools I build for how I work",
  intro:
    "The skills I use on my own repositories, packaged as one Claude Code plugin. Rosalbito is the entry point; companion skills join in when a task calls for them.",
  teaser: "Also: the Claude Code skills I build",
  afterInstall: "Restart Claude Code inside the target repository.",
  qualifiedNote: "If another skill is called rosalbito, use /rosalbito:rosalbito — it always works.",
  thenTry: "Then:",
  realRun: {
    // Condensed from the real evidence log of the run that packaged the plugin.
    lines: [
      "risk=MEDIUM floor=MEDIUM human=visibility",
      "✓ plugin-validate — exit 0 — evidence #10",
      "✓ plugin-hook — exit 0 — evidence #12",
      "✓ plugin-hook-e2e — exit 0 — evidence #7",
      "✓ suite — exit 0 — evidence #11",
    ],
    caption:
      "Condensed from the evidence log of the run that packaged this plugin: each line is a check that ran, with its exit code. A run is only done when it can cite lines like these.",
  },
} as const;

export const skills: Skill[] = [
  {
    slug: "rosalbito",
    title: "Rosalbito",
    summary:
      "One command for every engineering task. It classifies work by risk, runs an autonomous understand → plan → implement → verify → review loop, and delivers a verified pull request — or a precise question when a human is genuinely needed.",
    kind: "Entry point",
    highlights: [
      "Overhead scales with the task: a typo gets near-zero ceremony; a critical change gets fresh-context adversarial reviewers and an engineering report.",
      "Deterministic verification is the backbone — every check runs through a script that records exit codes as evidence; 'done' cites evidence.",
      "Hard gates are mechanisms, not prompts: a PreToolUse hook denies force-pushes, pushes to main, production deploys, destructive SQL and PR merges.",
      "The pull request is the human gate. Rosalbito never deploys and never merges.",
      "State survives: a fresh session resumes an interrupted run from its state file.",
    ],
    invoke: [
      "/rosalbito add an integration test that runs the CLI on the sample CSV",
      "/rosalbito status",
      "/rosalbito",
    ],
    links: [{ label: "GitHub", href: skillsRepo }],
  },
  {
    slug: "telemetry",
    title: "Telemetry",
    summary:
      "A model-invoked companion skill for telemetry engineering: adding, changing and verifying traces, metrics and structured logs, and keeping a repo's telemetry context so the next change starts from what is already instrumented.",
    kind: "Companion skill",
    highlights: [
      "Ships in the same plugin as Rosalbito — no separate install.",
      "No command to remember: the model reaches for it on telemetry-shaped tasks, such as “add tracing” or “add a metric for…”.",
    ],
    invoke: [],
    links: [{ label: "GitHub", href: `${skillsRepo}/tree/main/skills/telemetry` }],
  },
];

/** Shown next to the bare `/rosalbito` example, which is not self-explanatory. */
export const invokeNotes: Record<string, string> = {
  "/rosalbito": "resumes an interrupted run",
};
