// Single source of truth for projects.
// Drives: home project cards, /projects/[slug] pages, metadata, JSON-LD, sitemap
// and the 3D gateways (order = gateway order along the causeway).
// All facts below come from the public GitHub repositories.

export type Project = {
  slug: string;
  title: string;
  outcome: string;
  role: string;
  year: string;
  stack: string[];
  highlights: string[];
  links: { label: string; href: string }[];
  video: string | null;
  /** 3D hint only: which landmark the gateway carries. */
  landmark: "portal" | "eth";
};

export const projects: Project[] = [
  {
    slug: "rust-tx-processor",
    title: "Rust Transaction Processor",
    outcome:
      "A CLI payment engine that streams a CSV of transactions and outputs final account balances, including disputes, resolutions and chargebacks.",
    role: "Design and implementation",
    year: "2026",
    stack: ["Rust", "CSV streaming", "Fixed-point arithmetic"],
    highlights: [
      "Money is a fixed-point type (i64 scaled by 10,000) with checked arithmetic — no floating-point path, overflow surfaces as an explicit error.",
      "Invalid rows and rejected transactions are logged to stderr while processing continues without panicking.",
      "Full dispute lifecycle: held funds, resolve, and chargeback with account locking.",
      "Ships with a load generator for stress-testing large CSV inputs.",
    ],
    links: [{ label: "GitHub", href: "https://github.com/PedroRosalba/rust-tx-processor" }],
    video: null,
    landmark: "portal",
  },
  {
    slug: "stealth-address-template",
    title: "Stealth Address Template",
    outcome:
      "A starter app for private payments on Starknet: senders pay to one-time stealth addresses, recipients scan and claim.",
    role: "Design and implementation",
    year: "2026",
    stack: ["TypeScript", "Next.js", "Starknet", "Cavos"],
    highlights: [
      "Two complete flows: a sender wizard for stealth payments and a recipient wizard for meta-address setup, scanning and claiming.",
      "Integrates a Starknet stealth-address SDK with factory and registry contract ABIs.",
      "Wallet connection handled through Cavos, so the template works as a base for new apps.",
    ],
    links: [
      {
        label: "GitHub",
        href: "https://github.com/PedroRosalba/basecamp-cavos-stealthaddress-template",
      },
    ],
    video: null,
    landmark: "eth",
  },
  {
    slug: "space-invaders-topology",
    title: "Collaborative Space Invaders",
    outcome:
      "A multiplayer Space Invaders where everyone in a room cooperates to clear the ships, with game state shared over the Topology network.",
    role: "Design and implementation",
    year: "2024",
    stack: ["TypeScript", "Next.js", "Topology (CRDT objects)"],
    highlights: [
      "Game state lives in replicated Topology objects; a GameBoard object tracks players, ships and bullets.",
      "Multiple players share one room and one board, with positions updated as the game runs.",
    ],
    links: [{ label: "GitHub", href: "https://github.com/PedroRosalba/space-invaders-topology" }],
    video: null,
    landmark: "portal",
  },
];

export function getProject(slug: string) {
  return projects.find((p) => p.slug === slug);
}
